import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Get the pathname of the request (e.g. /, /dashboard, /leads)
  const { pathname } = request.nextUrl

  // Define protected paths
  const protectedPaths = ['/dashboard', '/leads', '/settings']
  const authPaths = ['/login', '/register']

  // Check if the current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path))
  const isAuthPath = authPaths.some(path => pathname.startsWith(path))

  // Get session token from cookies
  const sessionToken = request.cookies.get('authjs.session-token') 
    || request.cookies.get('__Secure-authjs.session-token')

  // If user has session and trying to access auth pages, redirect to dashboard
  if (sessionToken && isAuthPath) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // If user has no session and trying to access protected pages, redirect to login
  if (!sessionToken && isProtectedPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}