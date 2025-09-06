import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { webhookUrl } = body

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
    }

    // Send test payload to webhook
    const testPayload = {
      event: 'test',
      timestamp: new Date().toISOString(),
      message: 'This is a test webhook from Simple Lead Forwarder',
      lead: {
        id: 'test-' + Date.now(),
        form_id: 'test-form',
        form_name: 'Test Form',
        page_id: 'test-page',
        page_name: 'Test Page',
        created_time: new Date().toISOString(),
        fields: {
          full_name: 'Test User',
          email: 'test@example.com',
          phone: '+1234567890'
        }
      }
    }

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Source': 'simple-lead-forwarder-test',
        'X-Timestamp': new Date().toISOString()
      },
      body: JSON.stringify(testPayload),
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    if (response.ok) {
      return NextResponse.json({ 
        success: true,
        message: 'Test webhook sent successfully',
        status: response.status
      })
    } else {
      return NextResponse.json({ 
        error: `Webhook returned status ${response.status}`,
        status: response.status
      }, { status: 400 })
    }
  } catch (error) {
    console.error('Webhook test error:', error)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Webhook test timed out after 10 seconds'
        }, { status: 408 })
      }
      
      return NextResponse.json({ 
        error: `Failed to test webhook: ${error.message}`
      }, { status: 500 })
    }
    
    return NextResponse.json({ 
      error: 'Failed to test webhook'
    }, { status: 500 })
  }
}