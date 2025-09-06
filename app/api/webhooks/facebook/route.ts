import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLeadDetails, parseLeadData } from '@/lib/facebook'
import { forwardLeadToWebhooks } from '@/lib/webhook-forwarder'
import { cookies } from 'next/headers'
import crypto from 'crypto'

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.FACEBOOK_APP_SECRET) {
    console.log('No signature provided or app secret missing, allowing request')
    return true // Allow for testing - in production you might want to be stricter
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
    .update(body)
    .digest('hex')
  
  const isValid = signature === `sha256=${expectedSignature}`
  console.log('Signature verification:', { provided: signature, expected: `sha256=${expectedSignature}`, isValid })
  
  return isValid
}

// Forward lead to simple app webhook
async function forwardToSimpleAppWebhook(leadData: any, webhookUrl: string) {
  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'simple-lead-forwarder',
        'X-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify({
        event: 'lead.received',
        timestamp: new Date().toISOString(),
        lead: leadData
      }),
      signal: AbortSignal.timeout(30000) // 30 second timeout
    })

    return response.ok
  } catch (error) {
    console.error('Error forwarding lead to simple app webhook:', error)
    return false
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  
  console.log('Webhook received:', {
    headers: Object.fromEntries(request.headers.entries()),
    bodyPreview: rawBody.substring(0, 200),
    signature
  })
  
  // Verify webhook signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    console.log('Invalid signature, rejecting webhook')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }
  
  let body
  try {
    body = JSON.parse(rawBody)
  } catch (error) {
    console.error('Failed to parse webhook body:', error)
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  
  try {
    console.log('Processing webhook data:', JSON.stringify(body, null, 2))
    
    // Process lead data
    for (const entry of body.entry || []) {
      console.log('Processing entry:', entry.id, 'with changes:', entry.changes?.length || 0)
      
      for (const change of entry.changes || []) {
        console.log('Processing change:', change.field, change.value)
        
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id
          const pageId = entry.id
          
          console.log(`Processing lead ${leadgenId} from page ${pageId}`)
          
          // Get page info from database
          const page = await prisma.facebookPage.findUnique({
            where: { pageId }
          })
          
          if (!page) {
            console.error(`Page ${pageId} not found in database, checking simple app configuration`)
            
            // Check if this is for simple app by looking for simple-config cookie
            const cookieStore = cookies()
            const configCookie = cookieStore.get('simple-config')
            
            if (configCookie) {
              try {
                const config = JSON.parse(configCookie.value)
                console.log('Found simple app configuration:', { pageId: config.pageId, formId: config.formId })
                
                // Check if this lead is for the configured page
                if (pageId === config.pageId) {
                  const formId = change.value.form_id
                  
                  // Check if it's from the configured form (if specified)
                  if (!config.formId || formId === config.formId) {
                    console.log(`Processing simple app lead ${leadgenId} from page ${pageId}`)
                    
                    // Fetch lead details from Facebook using the simple app's access token
                    const leadResponse = await fetch(
                      `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${config.accessToken}`
                    )
                    
                    if (leadResponse.ok) {
                      const leadData = await leadResponse.json()
                      
                      // Parse field data
                      const fields: any = {}
                      if (leadData.field_data) {
                        for (const field of leadData.field_data) {
                          fields[field.name] = field.values?.[0] || ''
                        }
                      }
                      
                      // Prepare lead object for simple app
                      const leadForForwarding = {
                        id: leadgenId,
                        form_id: formId || config.formId,
                        form_name: config.formName,
                        page_id: pageId,
                        page_name: config.pageName,
                        created_time: leadData.created_time,
                        fields: fields,
                        raw_data: leadData
                      }
                      
                      // Forward to simple app webhook
                      const forwarded = await forwardToSimpleAppWebhook(leadForForwarding, config.webhookUrl)
                      
                      if (forwarded) {
                        console.log(`Successfully forwarded simple app lead ${leadgenId}`)
                      } else {
                        console.error(`Failed to forward simple app lead ${leadgenId}`)
                      }
                    } else {
                      console.error('Failed to fetch lead details for simple app')
                    }
                  } else {
                    console.log(`Ignoring lead from different form: ${formId} (expected: ${config.formId})`)
                  }
                } else {
                  console.log(`Ignoring lead for different page: ${pageId} (expected: ${config.pageId})`)
                }
              } catch (configError) {
                console.error('Error parsing simple app configuration:', configError)
              }
            } else {
              console.log('No simple app configuration found, creating test lead')
              // Still try to create a lead even if page not found (for testing)
              const lead = await prisma.lead.create({
                data: {
                  name: 'Test Lead',
                  email: `test-${Date.now()}@facebook.com`,
                  phone: null,
                  message: `Test lead from page ${pageId}`,
                  source: 'facebook_leadgen',
                  pageId: pageId, // Use Facebook page ID directly
                  userId: 'test-user', // Temporary for testing
                  metadata: JSON.stringify({
                    leadgenId,
                    pageId,
                    timestamp: new Date().toISOString(),
                    testLead: true
                  })
                }
              })
              console.log(`Test lead created: ${lead.id}`)
            }
            continue
          }
          
          try {
            // Fetch lead details from Facebook
            const leadDetails = await getLeadDetails(leadgenId, page.accessToken)
            const leadInfo = parseLeadData(leadDetails.field_data)
            
            console.log('Lead details fetched:', leadInfo)
            
            // Save lead to database
            const lead = await prisma.lead.create({
              data: {
                name: leadInfo.name || 'Unknown',
                email: leadInfo.email || '',
                phone: leadInfo.phone || null,
                message: leadInfo.message || null,
                source: 'facebook_leadgen',
                pageId: page.id,
                userId: page.userId,
                metadata: JSON.stringify({
                  ...leadInfo.metadata,
                  leadgenId,
                  timestamp: new Date().toISOString()
                })
              }
            })
            
            // Create notification
            await prisma.notification.create({
              data: {
                userId: page.userId,
                type: 'new_lead',
                title: 'New Lead Received',
                message: `New lead ${leadInfo.name || 'Unknown'} from ${page.name}`
              }
            })
            
            console.log(`Lead saved successfully: ${lead.id}`)

            // Forward lead to external webhooks
            try {
              const leadForForwarding = {
                id: lead.id,
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                message: lead.message,
                source: lead.source,
                status: lead.status,
                createdAt: lead.createdAt.toISOString(),
                metadata: JSON.parse(lead.metadata || '{}'),
                page: {
                  name: page.name,
                  pageId: page.pageId
                }
              }

              await forwardLeadToWebhooks(leadForForwarding, page.userId, page.pageId)
            } catch (forwardingError) {
              console.error('Error forwarding lead to webhooks:', forwardingError)
              // Don't fail the main webhook processing if forwarding fails
            }
          } catch (fetchError) {
            console.error(`Failed to fetch lead details for ${leadgenId}:`, fetchError)
            // Create a basic lead record even if we can't fetch details
            const lead = await prisma.lead.create({
              data: {
                name: 'Lead (Details pending)',
                email: `lead-${leadgenId}@facebook.com`,
                phone: null,
                message: 'Lead details could not be fetched from Facebook',
                source: 'facebook_leadgen',
                pageId: page.id,
                userId: page.userId,
                metadata: JSON.stringify({
                  leadgenId,
                  error: fetchError instanceof Error ? fetchError.message : 'Unknown error',
                  timestamp: new Date().toISOString()
                })
              }
            })
            console.log(`Basic lead record created: ${lead.id}`)
          }
        }
      }
    }
    
    return NextResponse.json({ success: true, message: 'Webhook processed successfully' })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Processing failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 })
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  if (mode === 'subscribe' && token === process.env.NEXTAUTH_SECRET) {
    console.log('Webhook verified')
    return new Response(challenge)
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
}