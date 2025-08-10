import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // If user is logged in, redirect from auth pages to dashboard
  if (sessionCookie && AUTH_ROUTES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in, redirect from protected pages to login
  if (!sessionCookie && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Role-based access control
  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      const adminUids = (process.env.ADMIN_UIDS || '').split(',');
      const isAdmin = adminUids.includes(decodedClaims.uid);

      if (pathname.startsWith('/admin') && !isAdmin) {
        // Non-admin trying to access /admin
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

      if (pathname.startsWith('/dashboard') && isAdmin) {
        // Admin trying to access /dashboard
        return NextResponse.redirect(new URL('/admin', request.url));
      }
    } catch (error) {
       // Invalid session, redirect to login
       if (PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.delete('session');
        return response;
       }
    }
  }


  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
