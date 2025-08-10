

'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Branch, Holiday, SocietyConfig, ComplianceSettings } from '@/lib/definitions';
import { ADMIN_ROLES } from '@/lib/definitions';
import { FieldValue } from 'firebase-admin/firestore';

const SETTINGS_DOC_ID = 'societyDetails';


async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized for this action');
  }
  return session;
}


// --- Society Config Management ---
export async function getSocietyConfig(): Promise<SocietyConfig> {
    const doc = await adminDb.collection('settings').doc(SETTINGS_DOC_ID).get();
    if (!doc.exists) {
        // Return a default config if one doesn't exist
        return {
            name: 'Amulya Cooperative Society',
            registrationNumber: 'Not Set',
            address: 'Not Set',
            kycRetentionYears: 7,
            upiId: '',
            savingsPrefix: 'SAV',
            savingsNextNumber: 1001,
            loanPrefix: 'LOAN',
            loanNextNumber: 1001,
            depositPrefix: 'DEP',
            depositNextNumber: 1001,
        };
    }
    return doc.data() as SocietyConfig;
}

export async function updateSocietyConfig(prevState: any, formData: FormData) {
    await verifyAdmin();
    const config: Partial<SocietyConfig> = {
        name: formData.get('societyName') as string,
        registrationNumber: formData.get('registrationNumber') as string,
        address: formData.get('address') as string,
    };

    try {
        await adminDb.collection('settings').doc(SETTINGS_DOC_ID).set(config, { merge: true });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateAccountNumberSeries(prevState: any, formData: FormData) {
    await verifyAdmin();
    const seriesData: Partial<SocietyConfig> = {
        savingsPrefix: formData.get('savingsPrefix') as string,
        savingsNextNumber: parseInt(formData.get('savingsNextNumber') as string, 10),
        loanPrefix: formData.get('loanPrefix') as string,
        loanNextNumber: parseInt(formData.get('loanNextNumber') as string, 10),
        depositPrefix: formData.get('depositPrefix') as string,
        depositNextNumber: parseInt(formData.get('depositNextNumber') as string, 10),
    };

    if (isNaN(seriesData.savingsNextNumber!) || isNaN(seriesData.loanNextNumber!) || isNaN(seriesData.depositNextNumber!)) {
        return { success: false, error: 'Next number must be a valid integer.' };
    }

    try {
        await adminDb.collection('settings').doc(SETTINGS_DOC_ID).set(seriesData, { merge: true });
        revalidatePath('/admin/settings');
        return { success: true, message: 'Account number series updated successfully.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function updateUpiId(prevState: any, formData: FormData) {
    await verifyAdmin();
    const upiId = formData.get('upiId') as string;

    // Simple validation for VPA format
    if (upiId && !/^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId)) {
        return { success: false, error: 'Please enter a valid UPI ID (e.g., yourname@bank).' };
    }

    try {
        await adminDb.collection('settings').doc(SETTINGS_DOC_ID).set({ upiId: upiId }, { merge: true });
        revalidatePath('/admin/integrations');
        revalidatePath('/dashboard');
        return { success: true, message: 'UPI ID updated successfully.' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function updateComplianceSettings(prevState: any, formData: FormData) {
    await verifyAdmin();
    const settings: Partial<ComplianceSettings> = {
        kycRetentionYears: parseInt(formData.get('kycRetentionYears') as string, 10),
    };

    if (isNaN(settings.kycRetentionYears)) {
        return { success: false, error: "Invalid retention period." };
    }

    try {
        await adminDb.collection('settings').doc(SETTINGS_DOC_ID).set(settings, { merge: true });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Branch Management ---

export async function getBranches(): Promise<Branch[]> {
    await verifyAdmin();
    const snapshot = await adminDb.collection('branches').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Branch));
}

export async function addBranch(prevState: any, formData: FormData) {
    await verifyAdmin();
    const name = formData.get('name') as string;
    const address = formData.get('address') as string;

    if (!name || !address) {
        return { success: false, error: "Branch name and address are required." };
    }

    try {
        await adminDb.collection('branches').add({ name, address });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteBranch(branchId: string) {
    await verifyAdmin();
    try {
        await adminDb.collection('branches').doc(branchId).delete();
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Holiday Management ---

export async function getHolidays(): Promise<Holiday[]> {
    // This can be read by any authenticated user
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const snapshot = await adminDb.collection('holidays').orderBy('date').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Holiday));
}

export async function addHoliday(prevState: any, formData: FormData) {
    await verifyAdmin();
    const name = formData.get('name') as string;
    const date = formData.get('date') as string; // Expects YYYY-MM-DD
    const type = formData.get('type') as Holiday['type'];

    if (!name || !date || !type) {
        return { success: false, error: "All holiday fields are required." };
    }
     if (!['National', 'Regional', 'Cooperative'].includes(type)) {
        return { success: false, error: "Invalid holiday type." };
    }

    try {
        await adminDb.collection('holidays').add({ name, date, type });
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteHoliday(holidayId: string) {
    await verifyAdmin();
    try {
        await adminDb.collection('holidays').doc(holidayId).delete();
        revalidatePath('/admin/settings');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// This is an internal function to be used by other server actions within a Firestore transaction
export async function getNextAccountNumber(
    t: FirebaseFirestore.Transaction,
    type: 'savings' | 'loan' | 'deposit'
): Promise<string> {
    const settingsRef = adminDb.collection('settings').doc(SETTINGS_DOC_ID);
    const settingsDoc = await t.get(settingsRef);
    const settings = settingsDoc.data() as SocietyConfig;

    const prefix = settings[`${type}Prefix`] || type.toUpperCase().slice(0,3);
    const nextNumber = settings[`${type}NextNumber`] || 1001;
    const fieldToUpdate = `${type}NextNumber`;

    // Increment the number for the next time
    t.update(settingsRef, { [fieldToUpdate]: FieldValue.increment(1) });
    
    // Return the formatted number (e.g., SAV-1001)
    return `${prefix}-${nextNumber}`;
}
