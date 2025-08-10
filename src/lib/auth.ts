import { cookies } from 'next/headers';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import type { UserSession, Role } from '@/lib/definitions';
import { cache } from 'react';
import { ROLES } from './definitions';

export const getSession = cache(async (): Promise<UserSession | null> => {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    
    // Temporary hardcode for admin user to ensure access during debugging
    if (decodedClaims.email === 'anujkumar7676@gmail.com') {
      return {
        uid: decodedClaims.uid,
        email: decodedClaims.email || null,
        name: decodedClaims.name || decodedClaims.email,
        picture: decodedClaims.picture || null,
        role: 'admin',
      };
    }
    
    // Get role from custom claims first
    let userRole: Role = (decodedClaims.role as Role) || 'member';

    // Verify role is valid
    const role = ROLES.includes(userRole) ? userRole : 'member';

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      name: decodedClaims.name || decodedClaims.email,
      picture: decodedClaims.picture || null,
      role: role,
    };
  } catch (error) {
    // Session cookie is invalid.
    console.error("Error verifying session cookie:", error);
    return null;
  }
});
