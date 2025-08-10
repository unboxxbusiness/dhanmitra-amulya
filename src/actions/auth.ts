
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { ROLES, type Role, ADMIN_ROLES } from '@/lib/definitions';
import { DecodedIdToken } from 'firebase-admin/auth';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  try {
    const decodedClaims = await adminAuth.verifyIdToken(idToken);
    const userRef = adminDb.collection('users').doc(decodedClaims.uid);
    const userDoc = await userRef.get();

    let role: Role = 'member'; // Default role
    let customClaims = { role };
    let name = decodedClaims.name;

    if (userDoc.exists) {
      const userData = userDoc.data();
      const userRole = userData?.role as Role;
      if (ROLES.includes(userRole)) {
        role = userRole;
      }
      // If the display name is missing from the auth token, get it from Firestore
      if (!name && userData?.name) {
        name = userData.name;
      }
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        email: decodedClaims.email,
        role: 'member',
        createdAt: new Date().toISOString(),
      });
    }
    
    // Set custom claims for role-based access
    // Only update if needed to avoid unnecessary writes
    if (decodedClaims.role !== role || decodedClaims.name !== name) {
        customClaims = { ...customClaims, role, name };
        await adminAuth.setCustomUserClaims(decodedClaims.uid, customClaims);
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    cookies().set(SESSION_COOKIE_NAME, sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return { success: true, role };
  } catch (error: any) {
    console.error('Failed to create session:', error.message);
    // Log the full error for better debugging
    console.error(error);
    return { error: `Failed to create session: ${error.message}`, role: 'member' };
  }
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export async function checkRole(role: Role) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) return false;

  try {
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
    return decodedClaims.role === role;
  } catch (error) {
    return false;
  }
}
