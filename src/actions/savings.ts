
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { getAllMembers } from './users';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant'];
const SETTINGS_DOC_ID = 'globalSavingsSettings';

async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
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
    // No auth check needed for reading schemes, can be public
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
    await verifyAdmin();
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
        return { success: false, error: error.message };
    }
}

// Account Management
export async function getSavingsAccounts(): Promise<SavingsAccount[]> {
    await verifyAdmin();
    try {
        const accountsSnapshot = await adminDb.collection('savingsAccounts').orderBy('createdAt', 'desc').get();
        
        const accounts = await Promise.all(accountsSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            
            // Batch fetches for user and scheme if they don't exist in a cache
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


function generateAccountNumber(): string {
    const prefix = 'ACC';
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}${timestamp}${randomSuffix}`;
}

export async function createSavingsAccount(prevState: any, formData: FormData) {
    const session = await verifyAdmin();
    const userId = formData.get('userId') as string;
    const schemeId = formData.get('schemeId') as string;
    const initialDeposit = parseFloat(formData.get('initialDeposit') as string) || 0;

    if (!userId || !schemeId) {
        return { success: false, error: 'Member and scheme are required.' };
    }

    try {
        // Fetch user and scheme details to ensure they exist
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const schemeDoc = await adminDb.collection('savingsSchemes').doc(schemeId).get();

        if (!userDoc.exists) {
            return { success: false, error: 'Selected member does not exist.' };
        }
        if (!schemeDoc.exists) {
            return { success: false, error: 'Selected scheme does not exist.' };
        }
        
        const newAccount = {
            userId,
            schemeId,
            accountNumber: generateAccountNumber(),
            balance: initialDeposit,
            status: 'Active' as const,
            createdAt: new Date().toISOString(),
            createdBy: session.uid,
        };

        await adminDb.collection('savingsAccounts').add(newAccount);

        revalidatePath('/admin/savings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// Settings Management
export async function getSavingsSettings(): Promise<SavingsSettings> {
    // No auth check needed for reading settings, can be public
    try {
        const settingsDoc = await adminDb.collection('settings').doc(SETTINGS_DOC_ID).get();
        if (settingsDoc.exists) {
            return settingsDoc.data() as SavingsSettings;
        } else {
            // Return default settings if none are found
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
    await verifyAdmin();

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
        return { success: false, error: error.message };
    }
}
