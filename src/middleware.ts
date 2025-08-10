import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth'; // Use relative path for middleware

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/admin'];
const ADMIN_ROLES: string[] = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  // If user is logged in, redirect from auth pages to their respective dashboard
  if (session && AUTH_ROUTES.includes(pathname)) {
    const destination = ADMIN_ROLES.includes(session.role) ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // If user is not logged in, redirect from protected pages to login
  if (!session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If a logged-in user is on a protected route, verify their role access
  if (session && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const isPrivilegedUser = ADMIN_ROLES.includes(session.role);

    // If a non-admin tries to access admin pages, redirect to their dashboard
    if (pathname.startsWith('/admin') && !isPrivilegedUser) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // If an admin tries to access the member dashboard, redirect to admin dashboard
    if (pathname.startsWith('/dashboard') && isPrivilegedUser) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
