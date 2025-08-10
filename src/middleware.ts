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

  // Handle users who are not logged in
  if (!session) {
    if ([...PROTECTED_ROUTES, ...ADMIN_ROUTES].some(route => pathname.startsWith(route))) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // Handle logged-in users
  const isPrivilegedUser = ADMIN_ROLES.includes(session.role);

  // If a logged-in user is on an auth page, redirect them to their dashboard
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
