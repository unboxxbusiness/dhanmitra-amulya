
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

  // If user is logged in
  if (session) {
    const isPrivileged = ADMIN_ROLES.includes(session.role);

    // Redirect from auth routes if logged in
    if (isAuthRoute) {
      const url = isPrivileged ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(url, request.url));
    }
    
    // Redirect non-admins trying to access admin routes
    if (isAdminRoute && !isPrivileged) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    return NextResponse.next();
  }

  // If user is not logged in
  if (!session) {
    // Protect routes
    if (isMemberRoute || isAdminRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
