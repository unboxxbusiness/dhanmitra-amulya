import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/admin'];
const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));

  // If user is logged in
  if (session) {
    const isPrivilegedUser = ADMIN_ROLES.includes(session.role);

    // If user is on an auth page, redirect them to their correct dashboard
    if (isAuthRoute) {
      const destination = isPrivilegedUser ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // If a non-admin tries to access /admin, redirect to /dashboard
    if (pathname.startsWith('/admin') && !isPrivilegedUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // If an admin tries to access /dashboard, redirect to /admin
    if (pathname.startsWith('/dashboard') && isPrivilegedUser) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  } else {
    // If user is not logged in and trying to access a protected route, redirect to login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
