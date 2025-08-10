import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './lib/auth';

const AUTH_ROUTES = ['/login', '/signup'];
const ADMIN_DASHBOARD = '/admin';
const MEMBER_DASHBOARD = '/dashboard';
const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Cloned to avoid mutation during session retrieval
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-next-pathname', pathname);

  const session = await getSession();

  const isAuthRoute = AUTH_ROUTES.includes(pathname);
  
  // If the user is logged in
  if (session) {
    const isPrivilegedUser = ADMIN_ROLES.includes(session.role);

    // If on an auth page, redirect to the correct dashboard
    if (isAuthRoute) {
      const destination = isPrivilegedUser ? ADMIN_DASHBOARD : MEMBER_DASHBOARD;
      return NextResponse.redirect(new URL(destination, request.url));
    }

    // If a non-admin tries to access the admin dashboard, redirect them
    if (pathname.startsWith(ADMIN_DASHBOARD) && !isPrivilegedUser) {
      return NextResponse.redirect(new URL(MEMBER_DASHBOARD, request.url));
    }
    
    // If an admin tries to access the member dashboard, redirect them
    if (pathname.startsWith(MEMBER_DASHBOARD) && isPrivilegedUser) {
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD, request.url));
    }

  } else {
    // If user is not logged in and tries to access a protected route
    if (pathname.startsWith(ADMIN_DASHBOARD) || pathname.startsWith(MEMBER_DASHBOARD)) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
