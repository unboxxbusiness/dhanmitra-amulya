
'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { adminAuth, adminDb } from '@/lib/firebase/server';
import { ROLES, type Role } from '@/lib/definitions';

const SESSION_COOKIE_NAME = 'session';
const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function createSession(idToken: string) {
  try {
    const decodedClaims = await adminAuth.verifyIdToken(idToken);
    const userRef = adminDb.collection('users').doc(decodedClaims.uid);
    const userDoc = await userRef.get();

    let role: Role = 'member'; // Default role
    let name = decodedClaims.name;
    let memberId: string | null = null;

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
      memberId = userData?.memberId || null;
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        email: decodedClaims.email,
        name: decodedClaims.name,
        role: 'member', // Safe default
        status: 'Active',
        createdAt: new Date().toISOString(),
      });
    }
    
    // Set custom claims for role-based access
    // Only update if needed to avoid unnecessary writes
    const currentCustomClaims = (await adminAuth.getUser(decodedClaims.uid)).customClaims;
    if (currentCustomClaims?.role !== role || decodedClaims.name !== name || currentCustomClaims?.memberId !== memberId) {
        const customClaims = { ...currentCustomClaims, role, name, memberId };
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
    console.error('Failed to create session:', error);
    return { error: 'An unexpected error occurred during login. Please try again.', role: 'member' };
  }
}

export async function signOut() {
  cookies().delete(SESSION_COOKIE_NAME);
  redirect('/login');
}
