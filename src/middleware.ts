
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard'];
const ADMIN_ROUTES = ['/admin'];
const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  // If the user is not logged in
  if (!session) {
    // If they are trying to access a protected route, redirect to login
    if ([...PROTECTED_ROUTES, ...ADMIN_ROUTES].some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Otherwise, allow them to proceed (e.g., to the login page)
    return NextResponse.next();
  }

  // If the user is logged in
  const isPrivilegedUser = ADMIN_ROLES.includes(session.role);

  // If a logged-in user is on an auth page, redirect them to their correct dashboard
  if (AUTH_ROUTES.includes(pathname)) {
    const url = isPrivilegedUser ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(url, request.url));
  }

  // If a non-admin tries to access an admin route, redirect to member dashboard
  if (pathname.startsWith('/admin') && !isPrivilegedUser) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  // If an admin is on the member dashboard, redirect to admin dashboard
  if (pathname.startsWith('/dashboard') && isPrivilegedUser) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
