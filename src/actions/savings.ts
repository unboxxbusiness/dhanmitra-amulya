

'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAllMembers } from './users';
import { ADMIN_ROLES } from '@/lib/definitions';
import { z } from 'zod';
import type { SavingsApplication } from '@/lib/definitions';
import { getNextAccountNumber } from './settings';
import { FieldValue } from 'firebase-admin/firestore';

const MEMBER_ROLES = [...ADMIN_ROLES, 'member'];
const SETTINGS_DOC_ID = 'globalSavingsSettings';

async function verifyUser(roles: string[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error('Not authorized');
  }
  return session;
}


export type SavingsScheme = {
    id: string;
    name: string;
    interestRate: number; // Annual rate in percentage, e.g., 5.5 for 5.5%
    description: string;
}

export type SavingsAccount = {
    id: string;
    userId: string;
    userName: string;
    schemeId: string;
    schemeName: string;
    accountNumber: string;
    balance: number;
    status: 'Active' | 'Dormant' | 'Closed';
    createdAt: string; // ISO String
}

export type SavingsSettings = {
    interestCalculationPeriod: 'daily' | 'monthly' | 'quarterly' | 'annually';
    latePaymentPenaltyRate: number;
    accountMaintenanceFee: number;
}


// Schemes Management
export async function getSavingsSchemes(): Promise<SavingsScheme[]> {
    await verifyUser(ADMIN_ROLES);
    try {
        const schemesSnapshot = await adminDb.collection('savingsSchemes').orderBy('name').get();
        return schemesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SavingsScheme));
    } catch (error) {
        console.error("Error fetching savings schemes:", error);
        return [];
    }
}

export async function getAvailableSavingsSchemes(): Promise<SavingsScheme[]> {
    await verifyUser(MEMBER_ROLES);
    try {
        const schemesSnapshot = await adminDb.collection('savingsSchemes').orderBy('name').get();
        return schemesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SavingsScheme));
    } catch (error) {
        console.error("Error fetching savings schemes:", error);
        return [];
    }
}

export async function addSavingsScheme(prevState: any, formData: FormData) {
    await verifyUser(ADMIN_ROLES);
    const name = formData.get('name') as string;
    const interestRate = parseFloat(formData.get('interestRate') as string);
    const description = formData.get('description') as string;

    if (!name || isNaN(interestRate) || !description) {
        return { success: false, error: 'Missing or invalid fields.' };
    }

    try {
        await adminDb.collection('savingsSchemes').add({
            name,
            interestRate,
            description,
            createdAt: new Date().toISOString(),
        });
        revalidatePath('/admin/savings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Could not create the scheme. Please try again.' };
    }
}

// Account Management
export async function getSavingsAccounts(): Promise<SavingsAccount[]> {
    await verifyUser(ADMIN_ROLES);
    try {
        const accountsSnapshot = await adminDb.collection('savingsAccounts').orderBy('createdAt', 'desc').get();
        
        const accounts = await Promise.all(accountsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            const userDoc = await adminDb.collection('users').doc(data.userId).get();
            const schemeDoc = await adminDb.collection('savingsSchemes').doc(data.schemeId).get();
            
            const userName = userDoc.exists ? userDoc.data()?.name : 'User Not Found';
            const schemeName = schemeDoc.exists ? schemeDoc.data()?.name : 'Scheme Not Found';

            return {
                id: doc.id,
                ...data,
                userName,
                schemeName,
                createdAt: new Date(data.createdAt).toLocaleDateString(),
            } as SavingsAccount;
        }));

        return accounts;
    } catch (error) {
        console.error("Error fetching savings accounts:", error);
        return [];
    }
}


export async function createSavingsAccount(prevState: any, formData: FormData) {
    const session = await verifyUser(ADMIN_ROLES);
    const userId = formData.get('userId') as string;
    const schemeId = formData.get('schemeId') as string;
    const initialDeposit = parseFloat(formData.get('initialDeposit') as string) || 0;

    if (!userId || !schemeId) {
        return { success: false, error: 'Member and scheme are required.' };
    }

    try {
        await adminDb.runTransaction(async (t) => {
            const userDoc = await t.get(adminDb.collection('users').doc(userId));
            const schemeDoc = await t.get(adminDb.collection('savingsSchemes').doc(schemeId));

            if (!userDoc.exists) {
                throw new Error('Selected member does not exist.');
            }
            if (!schemeDoc.exists) {
                throw new Error('Selected scheme does not exist.');
            }
            
            const newAccountNumber = await getNextAccountNumber(t, 'savings');
            
            const newAccount = {
                userId,
                schemeId,
                accountNumber: newAccountNumber,
                balance: initialDeposit,
                status: 'Active' as const,
                createdAt: new Date().toISOString(),
                createdBy: session.uid,
            };

            const newAccountRef = adminDb.collection('savingsAccounts').doc();
            t.set(newAccountRef, newAccount);
        });

        revalidatePath('/admin/savings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred while creating the account.' };
    }
}


// Settings Management
export async function getSavingsSettings(): Promise<SavingsSettings> {
    await verifyUser(ADMIN_ROLES);
    try {
        const settingsDoc = await adminDb.collection('settings').doc(SETTINGS_DOC_ID).get();
        if (settingsDoc.exists) {
            return settingsDoc.data() as SavingsSettings;
        } else {
            return {
                interestCalculationPeriod: 'monthly',
                latePaymentPenaltyRate: 1.5,
                accountMaintenanceFee: 0,
            };
        }
    } catch (error) {
        console.error("Error fetching savings settings:", error);
        throw new Error("Could not fetch settings.");
    }
}

export async function updateSavingsSettings(prevState: any, formData: FormData) {
    await verifyUser(ADMIN_ROLES);

    const settings: SavingsSettings = {
        interestCalculationPeriod: formData.get('interestCalculationPeriod') as SavingsSettings['interestCalculationPeriod'],
        latePaymentPenaltyRate: parseFloat(formData.get('latePaymentPenaltyRate') as string),
        accountMaintenanceFee: parseFloat(formData.get('accountMaintenanceFee') as string),
    };

    if (isNaN(settings.latePaymentPenaltyRate) || isNaN(settings.accountMaintenanceFee)) {
        return { success: false, error: 'Invalid number format for rates or fees.' };
    }

    try {
        await adminDb.collection('settings').doc(SETTINGS_DOC_ID).set(settings, { merge: true });
        revalidatePath('/admin/savings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'Could not update settings. Please try again.' };
    }
}

// Application Management
const ApplySavingsSchema = z.object({
  schemeId: z.string().min(1, 'Please select a savings scheme.'),
  initialDeposit: z.coerce.number().min(0, 'Initial deposit cannot be negative.'),
});

export async function applyForSavingsAccount(data: z.infer<typeof ApplySavingsSchema>) {
    const session = await verifyUser(MEMBER_ROLES);
    
    const validation = ApplySavingsSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const schemeDoc = await adminDb.collection('savingsSchemes').doc(validation.data.schemeId).get();
        if (!schemeDoc.exists) {
            return { success: false, error: 'Selected scheme does not exist.' };
        }
        
        const newApplication = {
            userId: session.uid,
            schemeId: validation.data.schemeId,
            initialDeposit: validation.data.initialDeposit,
            status: 'pending' as const,
            applicationDate: new Date().toISOString(),
        };

        await adminDb.collection('savingsApplications').add(newApplication);

        revalidatePath('/admin/savings');
        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        return { success: false, error: 'Could not submit your application. Please try again.' };
    }
}

export async function getSavingsApplications(): Promise<SavingsApplication[]> {
    await verifyUser(ADMIN_ROLES);
    const snapshot = await adminDb.collection('savingsApplications').where('status', '==', 'pending').get();
    
    const applications = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const schemeDoc = await adminDb.collection('savingsSchemes').doc(data.schemeId).get();
        
        return {
            id: doc.id,
            ...data,
            userName: userDoc.data()?.name || 'Unknown User',
            schemeName: schemeDoc.data()?.name || 'Unknown Scheme',
            applicationDate: new Date(data.applicationDate).toLocaleDateString(),
        } as SavingsApplication;
    }));
    
    return applications;
}

export async function approveSavingsApplication(applicationId: string) {
    const session = await verifyUser(ADMIN_ROLES);
    const appRef = adminDb.collection('savingsApplications').doc(applicationId);

    try {
        await adminDb.runTransaction(async (t) => {
            const appDoc = await t.get(appRef);
            if (!appDoc.exists) {
                throw new Error("Application not found.");
            }
            const appData = appDoc.data() as Omit<SavingsApplication, 'id' | 'userName' | 'schemeName' | 'applicationDate'> & { applicationDate: string };

            if (appData.status !== 'pending') {
                throw new Error("This application has already been processed.");
            }
            
            const newAccountNumber = await getNextAccountNumber(t, 'savings');

            const newAccount = {
                userId: appData.userId,
                schemeId: appData.schemeId,
                accountNumber: newAccountNumber,
                balance: appData.initialDeposit,
                status: 'Active' as const,
                createdAt: new Date().toISOString(),
                createdBy: session.uid,
            };

            const newAccountRef = adminDb.collection('savingsAccounts').doc();
            t.set(newAccountRef, newAccount);
            t.update(appRef, { status: 'approved', approvedBy: session.uid, approvalDate: new Date().toISOString() });
        });

        revalidatePath('/admin/savings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred while approving the application.' };
    }
}

export async function rejectSavingsApplication(applicationId: string) {
    await verifyUser(ADMIN_ROLES);
    try {
        await adminDb.collection('savingsApplications').doc(applicationId).update({
            status: 'rejected'
        });
        revalidatePath('/admin/savings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred while rejecting the application.' };
    }
}
