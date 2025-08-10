
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@/lib/auth';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_MEMBER_ROUTES = ['/dashboard'];
const PROTECTED_ADMIN_ROUTES = ['/admin'];
const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await getSession();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  const isMemberRoute = PROTECTED_MEMBER_ROUTES.some(p => pathname.startsWith(p));
  const isAdminRoute = PROTECTED_ADMIN_ROUTES.some(p => pathname.startsWith(p));

  // If the user is not logged in
  if (!session) {
    // If they are trying to access a protected route, redirect to login
    if (isMemberRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    // Otherwise, allow them to proceed (to access login, signup, home, etc.)
    return NextResponse.next();
  }

  // If the user is logged in
  const isPrivileged = ADMIN_ROLES.includes(session.role);

  // If they are on an auth route (login/signup), redirect them to their dashboard
  if (isAuthRoute) {
    const url = isPrivileged ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(url, request.url));
  }

  // If a non-privileged user tries to access an admin route, redirect to member dashboard
  if (isAdminRoute && !isPrivileged) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Otherwise, allow them to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
