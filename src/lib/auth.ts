import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/server';
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
    
    // Custom claims are used for roles. Default to 'member' if no role is assigned.
    let userRole: Role = (decodedClaims.role as Role) || 'member';

    // Temporary fix: Hardcode admin role for a specific user
    if (decodedClaims.email === 'anujkumar7676@gmail.com') {
      userRole = 'admin';
    }

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
    return null;
  }
});
