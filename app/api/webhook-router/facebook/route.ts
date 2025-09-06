import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import crypto from 'crypto'

function verifyWebhookSignature(body: string, signature: string | null): boolean {
  if (!signature || !process.env.FACEBOOK_APP_SECRET) {
    console.log('No signature provided or app secret missing, allowing request')
    return true // Allow for testing
  }
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET)
    .update(body)
    .digest('hex')
  
  const isValid = signature === `sha256=${expectedSignature}`
  console.log('Webhook router signature verification:', { provided: signature, expected: `sha256=${expectedSignature}`, isValid })
  
  return isValid
}

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-hub-signature-256')
  
  console.log('Webhook router received:', {
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
  
  console.log('Webhook router processing:', JSON.stringify(body, null, 2))
  
  // Check if this is for simple app by looking at the page IDs in the webhook
  const cookieStore = cookies()
  const configCookie = cookieStore.get('simple-config')
  
  let isSimpleApp = false
  let simpleConfig: any = null
  
  if (configCookie) {
    try {
      simpleConfig = JSON.parse(configCookie.value)
      console.log('Found simple app configuration:', { pageId: simpleConfig.pageId })
      
      // Check if any of the webhook entries match the simple app page
      for (const entry of body.entry || []) {
        if (entry.id === simpleConfig.pageId) {
          isSimpleApp = true
          console.log(`Routing webhook to simple app for page ${entry.id}`)
          break
        }
      }
    } catch (configError) {
      console.error('Error parsing simple app configuration:', configError)
    }
  }
  
  // Route to appropriate handler
  if (isSimpleApp && simpleConfig) {
    console.log('Forwarding to simple app webhook handler')
    
    // Forward to simple app webhook handler
    const simpleAppResponse = await fetch(
      `${request.url.replace('/api/webhook-router/facebook', '/simple/api/webhook/receive')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': signature || '',
          'cookie': `simple-config=${encodeURIComponent(configCookie.value)}`
        },
        body: rawBody
      }
    )
    
    if (simpleAppResponse.ok) {
      console.log('Simple app webhook processing successful')
      return NextResponse.json({ success: true, source: 'simple-app' })
    } else {
      console.error('Simple app webhook processing failed')
      return NextResponse.json({ error: 'Simple app processing failed' }, { status: 500 })
    }
  } else {
    console.log('Forwarding to main app webhook handler')
    
    // Forward to main app webhook handler
    const mainAppResponse = await fetch(
      `${request.url.replace('/api/webhook-router/facebook', '/api/webhooks/facebook')}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-hub-signature-256': signature || ''
        },
        body: rawBody
      }
    )
    
    if (mainAppResponse.ok) {
      console.log('Main app webhook processing successful')
      return NextResponse.json({ success: true, source: 'main-app' })
    } else {
      console.error('Main app webhook processing failed')
      return NextResponse.json({ error: 'Main app processing failed' }, { status: 500 })
    }
  }
}

// Facebook webhook verification for router
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')
  
  console.log('Webhook router verification:', { mode, token, challenge })
  
  if (mode === 'subscribe' && token === process.env.NEXTAUTH_SECRET) {
    console.log('Webhook router verified')
    return new Response(challenge)
  }
  
  return NextResponse.json({ error: 'Invalid request' }, { status: 403 })
}