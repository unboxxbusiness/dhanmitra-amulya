
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

// A helper function to verify if the current user is an admin
async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized');
  }
  return session;
}

export type UserProfile = {
  id: string;
  name: string | null;
  email: string | null;
  joinDate: string; // ISO string
  status: 'Active' | 'Suspended' | 'Resigned' | 'Pending';
  role: string;
};

export async function getAllMembers(): Promise<UserProfile[]> {
  await verifyAdmin();
  try {
    const usersSnapshot = await adminDb.collection('users').get();
    const users = usersSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || data.email || 'N/A',
        email: data.email || 'N/A',
        joinDate: data.createdAt ? new Date(data.createdAt).toISOString().split('T')[0] : 'N/A',
        status: data.status || 'Active',
        role: data.role || 'member',
      };
    });
    return users;
  } catch (error) {
    console.error('Error fetching all members:', error);
    return [];
  }
}

export type Application = {
    id: string;
    name: string;
    email: string;
    applyDate: string;
    status: 'pending' | 'approved' | 'rejected';
    kycDocs: {
        id: string;
        photo: string;
        addressProof: string;
    }
}

export async function getPendingApplications(): Promise<Application[]> {
    await verifyAdmin();
    try {
        const applicationsSnapshot = await adminDb.collection('applications').where('status', '==', 'pending').get();
        const applications = applicationsSnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.name,
                email: data.email,
                applyDate: data.applyDate,
                status: data.status,
                kycDocs: data.kycDocs
            } as Application;
        });
        return applications;
    } catch (error) {
        console.error('Error fetching pending applications:', error);
        return [];
    }
}
