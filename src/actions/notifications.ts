
'use server';

import { adminDb, admin } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import type { UserProfile } from '@/lib/definitions';
import { FieldValue } from 'firebase-admin/firestore';
import { ADMIN_ROLES } from '@/lib/definitions';

async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized for this action');
  }
  return session;
}


type SendNotificationPayload = {
  target: 'all' | 'single';
  userId?: string; // required if target is 'single'
  title: string;
  body: string;
};

// This function finds all invalid tokens and removes them from the corresponding user documents.
async function cleanupInvalidTokens(failedTokens: string[]) {
    if (failedTokens.length === 0) return;

    for (const token of failedTokens) {
        // Find users who have this invalid token
        const snapshot = await adminDb.collection('users').where('fcmTokens', 'array-contains', token).get();
        
        if (!snapshot.empty) {
            const batch = adminDb.batch();
            snapshot.forEach(doc => {
                console.log(`Removing invalid token for user: ${doc.id}`);
                const userRef = adminDb.collection('users').doc(doc.id);
                batch.update(userRef, {
                    fcmTokens: FieldValue.arrayRemove(token)
                });
            });
            await batch.commit();
        }
    }
}


export async function sendNotification(payload: SendNotificationPayload) {
  const session = await verifyAdmin();

  const { target, userId, title, body } = payload;

  if (!title || !body) {
    return { success: false, error: 'Title and body are required.' };
  }

  try {
    let tokens: string[] = [];
    const notificationData = {
        title,
        body,
        sentBy: session.name,
        sentAt: new Date().toISOString(),
        read: false,
    };
    
    const notificationRef = adminDb.collection('notifications').doc();


    if (target === 'single' && userId) {
      const userDoc = await adminDb.collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return { success: false, error: 'Target user not found.' };
      }
      const userData = userDoc.data() as UserProfile;
      tokens = userData.fcmTokens || [];
      if (tokens.length === 0) {
        // Save notice but inform admin that no push will be sent
        await notificationRef.set({ ...notificationData, userId });
        return { success: true, message: `Notice saved, but the selected user has no registered devices for push notifications.` };
      }
      // Save notification specifically for this user
      await notificationRef.set({ ...notificationData, userId });

    } else if (target === 'all') {
      const usersSnapshot = await adminDb.collection('users').where('fcmTokens', '!=', []).get();
      usersSnapshot.forEach(doc => {
        const userData = doc.data() as UserProfile;
        if (userData.fcmTokens && Array.isArray(userData.fcmTokens)) {
          tokens.push(...userData.fcmTokens);
        }
      });
      tokens = [...new Set(tokens)]; // Remove duplicate tokens
      // Save a global notification
      await notificationRef.set({ ...notificationData, target: 'all' });
    }

    if (tokens.length === 0) {
      // Still consider it a success if the notice was saved, even if no devices are registered.
      return { success: true, message: `Notice saved. No registered devices found to send push notifications.` };
    }

    const message = {
        notification: { title, body },
        webpush: {
            notification: {
                icon: '/icon-192x192.png',
                title, 
                body,
            },
        },
        tokens: tokens,
    };

    const response = await admin.messaging().sendEachForMulticast(message);
    const successfulSends = response.successCount;
    const failedSends = response.failureCount;

    if (failedSends > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                const errorCode = resp.error?.code;
                // Check for errors that indicate an invalid or unregistered token
                if (errorCode === 'messaging/registration-token-not-registered' || errorCode === 'messaging/invalid-registration-token') {
                    failedTokens.push(tokens[idx]);
                }
                console.error(`Failed to send to token: ${tokens[idx]}`, resp.error);
            }
        });
        
        // Asynchronously clean up the invalid tokens from Firestore
        if (failedTokens.length > 0) {
            await cleanupInvalidTokens(failedTokens);
        }
    }


    return { 
        success: true, 
        message: `Notifications sent and notice saved. Success: ${successfulSends}, Failed: ${failedSends}.`
    };

  } catch (error: any) {
    console.error("Error sending notification:", error);
    if (error.code === 'failed-precondition') {
        return { success: false, error: 'Query requires an index. Please ensure `firestore.indexes.json` is deployed correctly.' };
    }
    return { success: false, error: 'An unexpected error occurred while sending notifications.' };
  }
}

export async function getMemberNotifications() {
    const session = await getSession();
    if (!session) {
        throw new Error("Not authenticated");
    }

    const userNotificationsQuery = adminDb.collection('notifications').where('userId', '==', session.uid);
    const globalNotificationsQuery = adminDb.collection('notifications').where('target', '==', 'all');
    
    const [userSnapshot, globalSnapshot] = await Promise.all([
        userNotificationsQuery.get(),
        globalNotificationsQuery.get()
    ]);
    
    const notifications = [
        ...userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
        ...globalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    ];

    // Sort by date, newest first
    notifications.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());

    return notifications;
}
