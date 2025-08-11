
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
        return { success: true, message: `Notice saved, but the selected user has no registered devices for push notifications.` };
      }
      // Save notification specifically for this user
      await notificationRef.set({ ...notificationData, userId });

    } else if (target === 'all') {
      const usersSnapshot = await adminDb.collection('users').where('fcmTokens', 'array-contains-any', ['']).get();
      usersSnapshot.forEach(doc => {
        const userData = doc.data() as UserProfile;
        if (userData.fcmTokens) {
          tokens.push(...userData.fcmTokens);
        }
      });
      tokens = [...new Set(tokens)];
      // Save a global notification
      await notificationRef.set({ ...notificationData, target: 'all' });
    }

    if (tokens.length === 0) {
      // Still consider it a success if the notice was saved, even if no devices are registered.
      return { success: true, message: `Notice saved. No registered devices found to send push notifications.` };
    }

    const messageBatches = [];
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      messageBatches.push(chunk);
    }
    
    const message = {
        notification: { title, body },
        webpush: {
            notification: {
                icon: '/icon-192x192.png',
            },
        },
    };

    let successfulSends = 0;
    let failedSends = 0;

    for (const batch of messageBatches) {
         const response = await admin.messaging().sendToDevice(batch, message);
         successfulSends += response.successCount;
         failedSends += response.failureCount;
    }

    return { 
        success: true, 
        message: `Notifications sent and notice saved. Success: ${successfulSends}, Failed: ${failedSends}.`
    };

  } catch (error: any) {
    console.error("Error sending notification:", error);
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
