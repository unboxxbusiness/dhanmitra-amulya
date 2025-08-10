
'use server';

import { adminAuth, adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { ROLES, type Role, type UserProfile, type Application, type LoanApplication, type DepositApplication, type SavingsAccount, type Transaction, type ActiveLoan, type ActiveDeposit } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';
import Papa from 'papaparse';
import { FieldValue } from 'firebase-admin/firestore';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

// A helper function to verify if the current user is an admin
async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized');
  }
  return session;
}

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
        fcmTokens: data.fcmTokens || [],
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
        
        // Disable/enable user in Firebase Auth and revoke sessions if necessary
        if (status === 'Suspended' || status === 'Resigned') {
            await adminAuth.updateUser(userId, { disabled: true });
            // This is the critical step to force logout.
            await adminAuth.revokeRefreshTokens(userId);
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

export async function deleteMember(userId: string) {
    await verifyAdmin();
    try {
        await adminAuth.deleteUser(userId);
        await adminDb.collection('users').doc(userId).delete();
        // In a real production app, you would also need to handle cleanup
        // of related data (loans, deposits, etc.) which can be complex.
        revalidatePath('/admin/members');
        return { success: true };
    } catch (error: any) {
        console.error(`Error deleting user ${userId}:`, error);
        return { success: false, error: error.message };
    }
}


export async function submitApplication(data: Omit<Application, 'id' | 'applyDate' | 'status'>) {
    // This is a public action, no role check needed, just auth.
    if (!data.name || !data.email) {
        return { success: false, error: 'Missing user data for application.' };
    }

    try {
        const newApplication = {
            ...data,
            applyDate: new Date().toISOString(),
            status: 'pending',
        };
        await adminDb.collection('applications').add(newApplication);
        return { success: true };
    } catch (error: any) {
        console.error('Error submitting application:', error);
        return { success: false, error: error.message };
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
                applyDate: new Date(data.applyDate).toLocaleDateString(),
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

export async function approveApplication(applicationId: string) {
    await verifyAdmin();
    const appRef = adminDb.collection('applications').doc(applicationId);
    try {
        const appDoc = await appRef.get();
        if (!appDoc.exists) {
            throw new Error('Application not found.');
        }
        const appData = appDoc.data() as Application;

        // 1. Create user in Firebase Auth
        const tempPassword = Math.random().toString(36).slice(-8); // Generate temporary password
        const userRecord = await adminAuth.createUser({
            email: appData.email,
            password: tempPassword,
            displayName: appData.name,
        });

        // 2. Set custom claims (default to 'member' role)
        await adminAuth.setCustomUserClaims(userRecord.uid, { role: 'member' });

        // 3. Create user profile in Firestore 'users' collection
        await adminDb.collection('users').doc(userRecord.uid).set({
            name: appData.name,
            email: appData.email,
            role: 'member',
            status: 'Active',
            createdAt: new Date().toISOString(),
        });
        
        // 4. Update the application status
        await appRef.update({ status: 'approved' });

        // TODO: In a real app, you would email the user their temporary password.
        console.log(`User ${appData.email} approved. Temp password: ${tempPassword}`);
        
        revalidatePath('/admin/members');
        return { success: true };

    } catch (error: any) {
        console.error("Error approving application:", error);
        return { success: false, error: error.message };
    }
}

export async function rejectApplication(applicationId: string) {
    await verifyAdmin();
    try {
        await adminDb.collection('applications').doc(applicationId).update({ status: 'rejected' });
        revalidatePath('/admin/members');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
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
    const dataForCsv = members.map(({ id, fcmTokens, ...rest }) => rest);
    return Papa.unparse(dataForCsv);
}

export async function saveFcmToken(token: string) {
    const session = await getSession();
    if (!session) {
        return { success: false, error: 'Not authenticated' };
    }

    try {
        const userRef = adminDb.collection('users').doc(session.uid);
        await userRef.update({
            fcmTokens: FieldValue.arrayUnion(token)
        });
        return { success: true };
    } catch (error: any) {
        console.error("Error saving FCM token:", error);
        return { success: false, error: error.message };
    }
}

export type MemberFinancials = {
    savingsAccounts: SavingsAccount[],
    activeLoans: ActiveLoan[],
    activeDeposits: ActiveDeposit[],
    recentTransactions: Transaction[],
}

export async function getMemberFinancials(): Promise<MemberFinancials> {
    const session = await getSession();
    if (!session) {
        throw new Error("Not authenticated");
    }
    const userId = session.uid;

    try {
        const savingsPromise = adminDb.collection('savingsAccounts').where('userId', '==', userId).get();
        const loansPromise = adminDb.collection('activeLoans').where('userId', '==', userId).get();
        const depositsPromise = adminDb.collection('activeDeposits').where('userId', '==', userId).get();
        const transactionsPromise = adminDb.collection('transactions').where('userId', '==', userId).get();

        const [savingsSnap, loansSnap, depositsSnap, transSnap] = await Promise.all([savingsPromise, loansPromise, depositsPromise, transactionsPromise]);

        const savingsAccounts = savingsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: new Date(doc.data().createdAt).toLocaleDateString(),
        } as SavingsAccount));

        const activeLoans = loansSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            disbursalDate: new Date(doc.data().disbursalDate).toLocaleDateString(),
        } as ActiveLoan));

        const activeDeposits = depositsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            startDate: new Date(doc.data().startDate).toLocaleDateString(),
            maturityDate: new Date(doc.data().maturityDate).toLocaleDateString(),
        } as ActiveDeposit));
        
        const recentTransactions = transSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: new Date(doc.data().date).toLocaleDateString(),
        } as Transaction))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

        return {
            savingsAccounts,
            activeLoans,
            activeDeposits,
            recentTransactions
        }
    } catch (error: any) {
        console.error("Error fetching member financials:", error);
        throw new Error("Could not load financial data.");
    }
}
