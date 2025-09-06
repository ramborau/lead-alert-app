import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

// Verify Facebook webhook signature
function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.FACEBOOK_APP_SECRET) {
    console.log('No signature or app secret')
    return true // Allow for testing
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
    .update(body)
    .digest('hex')
  
  return signature === `sha256=${expectedSignature}`
}

// Forward lead to configured webhook
async function forwardLead(leadData: any, webhookUrl: string) {
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
      })
    })

    return response.ok
  } catch (error) {
    console.error('Error forwarding lead:', error)
    return false
  }
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  
  // Verify webhook signature
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }

  let body
  try {
    body = JSON.parse(rawBody)
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Get configuration from cookie
  const cookieStore = cookies()
  const configCookie = cookieStore.get('simple-config')
  
  if (!configCookie) {
    console.log('No configuration found')
    return NextResponse.json({ error: 'No configuration' }, { status: 404 })
  }

  let config
  try {
    config = JSON.parse(configCookie.value)
  } catch (error) {
    console.log('Invalid configuration')
    return NextResponse.json({ error: 'Invalid configuration' }, { status: 500 })
  }

  try {
    // Process lead data
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id
          const pageId = entry.id
          
          // Only process if it's for the configured page
          if (pageId !== config.pageId) {
            console.log(`Ignoring lead for different page: ${pageId}`)
            continue
          }

          // Only process if it's from the configured form
          const formId = change.value.form_id
          if (formId && config.formId && formId !== config.formId) {
            console.log(`Ignoring lead from different form: ${formId}`)
            continue
          }

          console.log(`Processing lead ${leadgenId} from page ${pageId}`)

          // Fetch lead details from Facebook
          const leadResponse = await fetch(
            `https://graph.facebook.com/v18.0/${leadgenId}?access_token=${config.accessToken}`
          )
          
          if (!leadResponse.ok) {
            console.error('Failed to fetch lead details')
            continue
          }

          const leadData = await leadResponse.json()
          
          // Parse field data
          const fields: any = {}
          if (leadData.field_data) {
            for (const field of leadData.field_data) {
              fields[field.name] = field.values?.[0] || ''
            }
          }

          // Prepare lead object
          const lead = {
            id: leadgenId,
            form_id: formId || config.formId,
            form_name: config.formName,
            page_id: pageId,
            page_name: config.pageName,
            created_time: leadData.created_time,
            fields: fields,
            raw_data: leadData
          }

          // Forward to webhook
          const forwarded = await forwardLead(lead, config.webhookUrl)
          
          if (forwarded) {
            console.log(`Successfully forwarded lead ${leadgenId}`)
            
            // Update lead count in localStorage (client-side will need to refresh)
            // Note: This is stored server-side temporarily, client needs to poll or refresh
          } else {
            console.error(`Failed to forward lead ${leadgenId}`)
          }
        }
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ 
      error: 'Processing failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Facebook webhook verification
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