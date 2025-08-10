import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/server';
import type { UserSession } from '@/lib/definitions';
import { cache } from 'react';

export const getSession = cache(async (): Promise<UserSession | null> => {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return null;
  }
  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    const adminUids = (process.env.ADMIN_UIDS || '').split(',');
    const isAdmin = adminUids.includes(decodedClaims.uid);

    return {
      uid: decodedClaims.uid,
      email: decodedClaims.email || null,
      name: decodedClaims.name || decodedClaims.email,
      picture: decodedClaims.picture || null,
      isAdmin,
    };
  } catch (error) {
    // Session cookie is invalid. This can happen if the user's session was revoked, the cookie expired, etc.
    return null;
  }
});
