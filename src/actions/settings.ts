
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { Branch, Holiday, SocietyConfig, ComplianceSettings } from '@/lib/definitions';

const ADMIN_ROLES = ['admin', 'branch_manager'];
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
        return {
            name: 'Amulya Cooperative Society',
            registrationNumber: 'Not Set',
            address: 'Not Set',
            kycRetentionYears: 7,
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
    // Public read might be acceptable for holidays
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
