import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { webhookUrl, authHeader, customHeaders } = body

    if (!webhookUrl) {
      return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
    }

    // Create test lead data
    const testLead = {
      id: 'test-lead-' + Date.now(),
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '+1234567890',
      message: 'This is a test lead from Lead Alert Pro webhook forwarding system',
      source: 'facebook_leadgen',
      status: 'new',
      createdAt: new Date().toISOString(),
      metadata: {
        test: true,
        timestamp: new Date().toISOString(),
        leadgenId: 'test-leadgen-id',
        pageId: 'test-page-id'
      },
      page: {
        name: 'Test Facebook Page',
        pageId: 'test-page-id'
      }
    }

    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'LeadAlertPro-Webhook/1.0'
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    if (customHeaders) {
      Object.assign(headers, customHeaders)
    }

    // Send test webhook
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: 'lead.test',
        lead: testLead,
        timestamp: new Date().toISOString()
      })
    })

    if (!webhookResponse.ok) {
      return NextResponse.json({
        error: `Webhook returned ${webhookResponse.status}: ${webhookResponse.statusText}`
      }, { status: 400 })
    }

    let responseData
    try {
      responseData = await webhookResponse.text()
    } catch (e) {
      responseData = 'No response body'
    }

    return NextResponse.json({
      success: true,
      status: webhookResponse.status,
      response: responseData.substring(0, 500) // Limit response size
    })

  } catch (error) {
    console.error('Error testing webhook:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json({
        error: 'Could not connect to webhook URL. Please check the URL is valid and accessible.'
      }, { status: 400 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}