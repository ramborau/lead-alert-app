import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: Request) {
  const session = await auth()
  
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  const facebookAuthUrl = new URL('https://www.facebook.com/v18.0/dialog/oauth')
  facebookAuthUrl.searchParams.append('client_id', process.env.FACEBOOK_APP_ID!)
  facebookAuthUrl.searchParams.append('redirect_uri', process.env.FACEBOOK_REDIRECT_URI!)
  facebookAuthUrl.searchParams.append('scope', 'public_profile,email,pages_manage_metadata')
  facebookAuthUrl.searchParams.append('response_type', 'code')
  facebookAuthUrl.searchParams.append('state', session.user.id)
  
  return NextResponse.redirect(facebookAuthUrl.toString())
}