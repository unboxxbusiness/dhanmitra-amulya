
'use server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/server';
import type { UserSession, Role } from '@/lib/definitions';
import { ROLES } from './definitions';

export const getSession = async (): Promise<UserSession | null> => {
  try {
    const sessionCookieValue = cookies().get('session')?.value;
    if (!sessionCookieValue) {
      return null;
    }
  
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookieValue, true);
    
    // Get role from custom claims which were set during session creation.
    const userRole = (decodedClaims.role as Role) || 'member';

    // Verify role is a valid one before returning.
    const role = ROLES.includes(userRole) ? userRole : 'member';

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      name: decodedClaims.name || decodedClaims.email,
      picture: decodedClaims.picture || null,
      role: role,
    };
  } catch (error: any) {
    // Session cookie is invalid or expired, or cookies() is not available in the context.
    // console.error("Error verifying session cookie:", error.message);
    return null;
  }
};
