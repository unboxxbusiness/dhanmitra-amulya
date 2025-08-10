
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

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
    await verifyAdmin();
    try {
        const schemesSnapshot = await adminDb.collection('savingsSchemes').get();
        return schemesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as SavingsScheme));
    } catch (error) {
        console.error("Error fetching savings schemes:", error);
        return [];
    }
}

export async function addSavingsScheme(formData: FormData) {
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
            const userDoc = await adminDb.collection('users').doc(data.userId).get();
            const schemeDoc = await adminDb.collection('savingsSchemes').doc(data.schemeId).get();
            
            return {
                id: doc.id,
                userId: data.userId,
                userName: userDoc.data()?.name || 'N/A',
                schemeId: data.schemeId,
                schemeName: schemeDoc.data()?.name || 'N/A',
                accountNumber: data.accountNumber,
                balance: data.balance,
                status: data.status,
                createdAt: new Date(data.createdAt).toLocaleDateString(),
            } as SavingsAccount;
        }));

        return accounts;
    } catch (error) {
        console.error("Error fetching savings accounts:", error);
        return [];
    }
}

// Settings Management
export async function getSavingsSettings(): Promise<SavingsSettings> {
    await verifyAdmin();
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

export async function updateSavingsSettings(formData: FormData) {
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
