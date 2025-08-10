
'use server';

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { ROLES, type Role } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';

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
  role: Role;
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

export async function addMember(formData: FormData) {
    await verifyAdmin();
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as Role;

    if (!name || !email || !password || !role || !ROLES.includes(role)) {
        return { success: false, error: "Missing or invalid fields" };
    }

    try {
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: name,
        });

        await adminAuth.setCustomUserClaims(userRecord.uid, { role });
        
        await adminDb.collection('users').doc(userRecord.uid).set({
            name,
            email,
            role,
            status: 'Active',
            createdAt: new Date().toISOString(),
        });

        revalidatePath('/admin/members');
        return { success: true };
    } catch (error: any) {
        console.error("Error adding member:", error);
        return { success: false, error: error.message };
    }
}

export async function updateUserProfile(userId: string, formData: FormData) {
    await verifyAdmin();
    const name = formData.get('name') as string;
    const role = formData.get('role') as Role;

     if (!name || !role || !ROLES.includes(role)) {
        return { success: false, error: "Missing or invalid fields" };
    }

    try {
        await adminAuth.updateUser(userId, { displayName: name });
        await adminAuth.setCustomUserClaims(userId, { role });
        await adminDb.collection('users').doc(userId).update({ name, role });

        revalidatePath('/admin/members');
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating profile for user ${userId}:`, error);
        return { success: false, error: error.message };
    }
}

export async function updateUserStatus(userId: string, status: UserProfile['status']) {
    await verifyAdmin();
    if (!['Active', 'Suspended', 'Resigned'].includes(status)) {
        return { success: false, error: 'Invalid status provided.' };
    }
    try {
        await adminDb.collection('users').doc(userId).update({ status });
        
        // Optionally disable/enable user in Firebase Auth
        if (status === 'Suspended' || status === 'Resigned') {
            await adminAuth.updateUser(userId, { disabled: true });
        } else if (status === 'Active') {
            await adminAuth.updateUser(userId, { disabled: false });
        }

        revalidatePath('/admin/members');
        return { success: true };
    } catch (error: any) {
        console.error(`Error updating status for user ${userId}:`, error);
        return { success: false, error: error.message };
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


export async function bulkImportMembers(csvContent: string) {
    await verifyAdmin();
    const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    if (parseResult.errors.length > 0) {
        return { success: false, error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
    }

    const members = parseResult.data as { name: string; email: string }[];
    const results = {
        successful: 0,
        failed: 0,
        errors: [] as { email: string; reason: string }[],
    };

    for (const member of members) {
        if (!member.email || !member.name) {
            results.failed++;
            results.errors.push({ email: member.email || 'N/A', reason: 'Missing name or email.' });
            continue;
        }

        try {
            // Generate a secure random password for the user.
            const tempPassword = Math.random().toString(36).slice(-8);

            const userRecord = await adminAuth.createUser({
                email: member.email,
                displayName: member.name,
                password: tempPassword,
            });

            const role: Role = 'member';
            await adminAuth.setCustomUserClaims(userRecord.uid, { role });

            await adminDb.collection('users').doc(userRecord.uid).set({
                name: member.name,
                email: member.email,
                role: role,
                status: 'Active',
                createdAt: new Date().toISOString(),
            });

            results.successful++;
        } catch (error: any) {
            results.failed++;
            results.errors.push({ email: member.email, reason: error.message });
        }
    }

    revalidatePath('/admin/members');
    return { success: true, results };
}

export async function exportMembersToCsv(): Promise<string> {
    await verifyAdmin();
    const members = await getAllMembers();
    const dataForCsv = members.map(({ id, ...rest }) => rest);
    return Papa.unparse(dataForCsv);
}
