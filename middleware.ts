import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request: NextRequest) {
  // 1. Check if route is protected
  const protectedPaths = ['/', '/admin']
  const isProtected = protectedPaths.some(path => request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/'))
  
  if (!isProtected) return NextResponse.next()

  // 2. Check for session cookie
  const cookie = request.cookies.get('session_token')
  
  if (!cookie?.value) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 3. Verify session
  try {
     // If we share the secret, we can verify it. If not, checking existence is a weak check but common in decoupled frontends.
     // Ideally we verify.
     if (process.env.JWT_SECRET) {
        await jwtVerify(cookie.value, key)
     }
  } catch (error) {
    console.log('Token verification failed', error)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
