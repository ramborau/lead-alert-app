import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const webhookUrl = searchParams.get('webhook_url')
  
  if (!webhookUrl) {
    return NextResponse.json({ error: 'Webhook URL is required' }, { status: 400 })
  }

  // Build Facebook OAuth URL
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
  
  // Request permissions for pages and lead gen
  facebookAuthUrl.searchParams.append('client_id', process.env.FACEBOOK_APP_ID!)
  facebookAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXTAUTH_URL}/simple/api/facebook/callback`)
  facebookAuthUrl.searchParams.append('scope', 'pages_show_list,pages_read_engagement,leads_retrieval,pages_manage_metadata')
  facebookAuthUrl.searchParams.append('response_type', 'code')
  facebookAuthUrl.searchParams.append('state', encodeURIComponent(webhookUrl)) // Pass webhook URL in state

  return NextResponse.redirect(facebookAuthUrl.toString())
}