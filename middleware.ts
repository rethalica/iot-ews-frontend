import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.JWT_SECRET)

interface JWTPayload {
  id: number;
  email: string;
  role: 'admin' | 'officer';
}

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

  // 3. Verify session and check role for admin routes
  try {
    let payload: JWTPayload | null = null;
    
    if (process.env.JWT_SECRET) {
      const verified = await jwtVerify(cookie.value, key)
      payload = verified.payload as unknown as JWTPayload
    }

    // 4. Check admin role for /admin/* routes
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
    if (isAdminRoute && payload?.role !== 'admin') {
      // Redirect non-admin users to home
      return NextResponse.redirect(new URL('/', request.url))
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
