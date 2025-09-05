import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { exchangeCodeForToken, getUserPages, subscribePageToWebhook, registerWebhookProgrammatically } from '@/lib/facebook'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state') // userId
  const error = searchParams.get('error')
  
  if (error) {
    return NextResponse.redirect(new URL('/settings?error=facebook_denied', process.env.NEXTAUTH_URL || 'https://lead-alert-app-fzlay.ondigitalocean.app'))
  }
  
  if (!code || !state) {
    return NextResponse.redirect(new URL('/settings?error=invalid_request', process.env.NEXTAUTH_URL || 'https://lead-alert-app-fzlay.ondigitalocean.app'))
  }
  
  try {
    // Register webhook programmatically (only needs to be done once)
    try {
      await registerWebhookProgrammatically()
    } catch (webhookError) {
      console.log('Webhook might already be registered:', webhookError)
    }
    
    // Exchange code for access token
    const accessToken = await exchangeCodeForToken(code)
    
    // Get user's Facebook pages
    const pages = await getUserPages(accessToken)
    
    // Save pages to database and subscribe to webhooks
    for (const page of pages) {
      // Save page to database
      await prisma.facebookPage.upsert({
        where: { pageId: page.id },
        update: {
          name: page.name,
          accessToken: page.access_token,
          userId: state,
          isActive: true
        },
        create: {
          pageId: page.id,
          name: page.name,
          accessToken: page.access_token,
          userId: state
        }
      })
      
      // Subscribe page to webhook
      try {
        await subscribePageToWebhook(page.id, page.access_token)
      } catch (subscribeError) {
        console.error(`Failed to subscribe page ${page.id}:`, subscribeError)
      }
    }
    
    // Save Facebook account info
    await prisma.account.upsert({
      where: {
        provider_providerAccountId: {
          provider: 'facebook',
          providerAccountId: state
        }
      },
      update: {
        access_token: accessToken
      },
      create: {
        userId: state,
        type: 'oauth',
        provider: 'facebook',
        providerAccountId: state,
        access_token: accessToken
      }
    })
    
    return NextResponse.redirect(new URL('/settings?success=facebook_connected', process.env.NEXTAUTH_URL || 'https://lead-alert-app-fzlay.ondigitalocean.app'))
  } catch (error) {
    console.error('Facebook callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=connection_failed', process.env.NEXTAUTH_URL || 'https://lead-alert-app-fzlay.ondigitalocean.app'))
  }
}