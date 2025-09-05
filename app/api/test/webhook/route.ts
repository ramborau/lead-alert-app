import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

// Test endpoint to simulate Facebook lead webhook
export async function POST(request: Request) {
  const session = await auth()
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Create a test lead
    const testLead = await prisma.lead.create({
      data: {
        name: 'Test Lead',
        email: `test-${Date.now()}@example.com`,
        phone: '+1-555-0123',
        message: 'This is a test lead generated for webhook testing.',
        source: 'webhook_test',
        pageId: 'test-page-id',
        userId: session.user.id,
        status: 'new',
        metadata: JSON.stringify({
          test: true,
          timestamp: new Date().toISOString(),
          source: 'webhook_test'
        })
      }
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId: session.user.id,
        type: 'test_lead',
        title: '🧪 Test Lead Generated',
        message: `Test lead "${testLead.name}" has been created successfully!`
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Test lead created successfully',
      lead: {
        id: testLead.id,
        name: testLead.name,
        email: testLead.email,
        createdAt: testLead.createdAt
      }
    })
  } catch (error) {
    console.error('Test webhook error:', error)
    return NextResponse.json(
      { error: 'Failed to create test lead' },
      { status: 500 }
    )
  }
}

// GET endpoint to check webhook status
export async function GET() {
  return NextResponse.json({
    status: 'active',
    message: 'Webhook endpoint is ready to receive leads',
    timestamp: new Date().toISOString(),
    endpoints: {
      production: '/api/webhooks/facebook',
      test: '/api/test/webhook'
    }
  })
}