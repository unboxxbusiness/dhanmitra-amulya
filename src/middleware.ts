import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase/server';
import type { Role } from '@/lib/definitions';
import { ROLES } from '@/lib/definitions';

const AUTH_ROUTES = ['/login', '/signup'];
const PROTECTED_ROUTES = ['/dashboard', '/admin'];
const ADMIN_ROLES: Role[] = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('session')?.value;

  // 1. If trying to access a protected route without a session, redirect to login
  if (!sessionCookie && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If logged in, handle routing based on role
  if (sessionCookie) {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
      const userRole = (decodedClaims.role as Role) || 'member';
      const role = ROLES.includes(userRole) ? userRole : 'member';
      const isPrivilegedUser = ADMIN_ROLES.includes(role);

      // 2a. If logged in, redirect away from auth pages
      if (AUTH_ROUTES.includes(pathname)) {
        const destination = isPrivilegedUser ? '/admin' : '/dashboard';
        return NextResponse.redirect(new URL(destination, request.url));
      }

      // 2b. If admin is trying to access member dashboard, redirect to admin dashboard
      if (pathname.startsWith('/dashboard') && isPrivilegedUser) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }

      // 2c. If a non-admin is trying to access admin pages, redirect to member dashboard
      if (pathname.startsWith('/admin') && !isPrivilegedUser) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
       // Session cookie is invalid. Clear it and redirect to login.
       const response = NextResponse.redirect(new URL('/login', request.url));
       response.cookies.delete('session');
       return response;
    }
  }

  // 3. If none of the above, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
