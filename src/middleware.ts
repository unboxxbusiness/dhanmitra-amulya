
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/admin'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session');

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // If user is logged in, redirect from auth pages to dashboard
  if (sessionCookie && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // If user is not logged in, redirect from protected pages to login
  if (!sessionCookie && isProtectedRoute) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
