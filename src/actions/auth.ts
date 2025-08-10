'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth } from '@/lib/firebase/server';
import { ROLES, type Role } from '@/lib/definitions';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  try {
    const decodedClaims = await adminAuth.verifyIdToken(idToken);
    
    let userRole: Role = (decodedClaims.role as Role) || 'member';

    // Temporary fix: Hardcode admin role for a specific user
    if (decodedClaims.email === 'anujkumar7676@gmail.com') {
      userRole = 'admin';
    }

    const role = ROLES.includes(userRole) ? userRole : 'member';

    // Set the role as a custom claim on the user's auth token.
    // This makes the role available throughout the session.
    await adminAuth.setCustomUserClaims(decodedClaims.uid, { role });

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
    });

    return { success: true, role };
  } catch (error) {
    console.error('Failed to create session:', error);
    return { error: 'Failed to create session.', role: 'member' };
  }
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
