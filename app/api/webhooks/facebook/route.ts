import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getLeadDetails, parseLeadData } from '@/lib/facebook'
import crypto from 'crypto'

function verifyWebhookSignature(body: any, signature: string | null): boolean {
  if (!signature) return false
  
  const expectedSignature = crypto
    .createHmac('sha256', process.env.FACEBOOK_APP_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex')
  
  return signature === `sha256=${expectedSignature}`
}

export async function POST(request: Request) {
  const body = await request.json()
  const signature = request.headers.get('x-hub-signature-256')
  
  // Verify webhook signature
  if (!verifyWebhookSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 })
  }
  
  try {
    // Process lead data
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'leadgen') {
          const leadgenId = change.value.leadgen_id
          const pageId = entry.id
          
          // Get page info from database
          const page = await prisma.facebookPage.findUnique({
            where: { pageId }
          })
          
          if (!page) {
            console.error(`Page ${pageId} not found in database`)
            continue
          }
          
          // Fetch lead details from Facebook
          const leadDetails = await getLeadDetails(leadgenId, page.accessToken)
          const leadInfo = parseLeadData(leadDetails.field_data)
          
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
              metadata: JSON.stringify(leadInfo.metadata || {})
            }
          })
          
          // Create notification
          await prisma.notification.create({
            data: {
              userId: page.userId,
              type: 'new_lead',
              title: 'New Lead Received',
              message: `New lead ${leadInfo.name} from ${page.name}`
            }
          })
          
          console.log(`Lead saved: ${lead.id}`)
        }
      }
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
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