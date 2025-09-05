import { prisma } from '@/lib/db'

export interface LeadData {
  id: string
  name: string
  email: string
  phone: string | null
  message: string | null
  source: string
  status: string
  createdAt: string
  metadata: any
  page?: {
    name: string
    pageId: string
  }
}

export async function forwardLeadToWebhooks(lead: LeadData, userId: string, pageId: string) {
  try {
    // Get active webhook configurations for this page
    const webhookConfigs = await prisma.webhookConfig.findMany({
      where: {
        userId,
        pageId,
        isActive: true
      }
    })

    if (webhookConfigs.length === 0) {
      console.log(`No active webhook configurations found for page ${pageId}`)
      return
    }

    console.log(`Found ${webhookConfigs.length} webhook configurations for page ${pageId}`)

    // Send lead to each configured webhook
    const forwardingPromises = webhookConfigs.map(async (config) => {
      try {
        // Prepare headers
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'LeadAlertPro-Webhook/1.0',
          'X-Lead-Source': 'facebook-leadgen',
          'X-Forwarded-From': 'lead-alert-pro'
        }

        // Add authorization header if configured
        if (config.authHeader) {
          headers['Authorization'] = config.authHeader
        }

        // Add custom headers if configured
        if (config.customHeaders) {
          try {
            const customHeaders = JSON.parse(config.customHeaders)
            Object.assign(headers, customHeaders)
          } catch (e) {
            console.error(`Invalid custom headers JSON for config ${config.id}:`, e)
          }
        }

        // Prepare webhook payload
        const webhookPayload = {
          event: 'lead.received',
          timestamp: new Date().toISOString(),
          lead: {
            ...lead,
            facebook_page: {
              id: pageId,
              name: lead.page?.name || 'Unknown Page'
            }
          },
          config: {
            id: config.id,
            pageName: config.pageName
          }
        }

        console.log(`Forwarding lead ${lead.id} to webhook: ${config.webhookUrl}`)

        // Send webhook request with retry logic
        let response: Response | null = null
        let lastError: Error | null = null
        const maxRetries = 3
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
          try {
            console.log(`Attempt ${attempt}/${maxRetries} for webhook: ${config.webhookUrl}`)
            
            response = await fetch(config.webhookUrl, {
              method: 'POST',
              headers,
              body: JSON.stringify(webhookPayload),
              signal: AbortSignal.timeout(30000) // Increased to 30 seconds
            })
            
            if (response.ok) {
              console.log(`Successfully forwarded lead ${lead.id} to ${config.webhookUrl} on attempt ${attempt}`)
              break
            } else {
              console.log(`Attempt ${attempt} failed with status ${response.status}: ${response.statusText}`)
              if (attempt < maxRetries) {
                // Wait before retry (exponential backoff)
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
              }
            }
          } catch (error) {
            lastError = error as Error
            console.log(`Attempt ${attempt} failed with error:`, error instanceof Error ? error.message : error)
            if (attempt < maxRetries) {
              // Wait before retry (exponential backoff)
              await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000))
            }
          }
        }

        if (response && response.ok) {
          console.log(`Successfully forwarded lead ${lead.id} to ${config.webhookUrl}`)
          
          // Update lastUsed timestamp
          await prisma.webhookConfig.update({
            where: { id: config.id },
            data: { lastUsed: new Date() }
          })
          
          return {
            configId: config.id,
            url: config.webhookUrl,
            success: true,
            status: response.status,
            statusText: response.statusText
          }
        } else {
          const errorMessage = lastError ? lastError.message : (response ? `${response.status} ${response.statusText}` : 'No response received')
          console.error(`Webhook forwarding failed for ${config.webhookUrl} after ${maxRetries} attempts: ${errorMessage}`)
          
          return {
            configId: config.id,
            url: config.webhookUrl,
            success: false,
            status: response?.status || 0,
            statusText: response?.statusText || 'Request failed',
            error: errorMessage
          }
        }
      } catch (error) {
        console.error(`Error forwarding to webhook ${config.webhookUrl}:`, error)
        return {
          configId: config.id,
          url: config.webhookUrl,
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }
    })

    // Wait for all webhook forwards to complete
    const results = await Promise.allSettled(forwardingPromises)
    
    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length

    console.log(`Webhook forwarding completed: ${successCount}/${webhookConfigs.length} successful`)

    return results.map(result => 
      result.status === 'fulfilled' ? result.value : { success: false, error: 'Promise rejected' }
    )

  } catch (error) {
    console.error('Error in webhook forwarding process:', error)
    throw error
  }
}