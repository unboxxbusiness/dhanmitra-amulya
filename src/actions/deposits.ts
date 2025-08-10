
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { addDays } from 'date-fns';
import type { DepositProduct, DepositApplication, ActiveDeposit } from '@/lib/definitions';
import { DepositProductSchema, TermSchema, ADMIN_ROLES } from '@/lib/definitions';
import { z } from 'zod';


const MEMBER_ROLES = ['member', ...ADMIN_ROLES];

async function verifyUser(roles: string[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error('Not authorized');
  }
  return session;
}

// Product Management (Admin)
export async function getDepositProducts(): Promise<DepositProduct[]> {
    await verifyUser(ADMIN_ROLES);
    const snapshot = await adminDb.collection('depositProducts').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositProduct));
}

// Product Management (Public for members)
export async function getAvailableDepositProducts(): Promise<DepositProduct[]> {
    await verifyUser(MEMBER_ROLES); // Any logged in user can see products
    const snapshot = await adminDb.collection('depositProducts').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepositProduct));
}

export async function addDepositProduct(product: Omit<DepositProduct, 'id'>) {
    await verifyUser(ADMIN_ROLES);
    try {
        const validation = DepositProductSchema.omit({id: true}).safeParse(product);
        if (!validation.success) {
            throw new Error(validation.error.errors.map(e => e.message).join(', '));
        }

        await adminDb.collection('depositProducts').add(validation.data);
        revalidatePath('/admin/deposits');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// Application Management

const MemberDepositApplicationSchema = z.object({
  productId: z.string().min(1, 'Please select a product.'),
  principalAmount: z.coerce.number().positive('Deposit amount must be positive.'),
  term: TermSchema,
});

export async function applyForDeposit(data: z.infer<typeof MemberDepositApplicationSchema>) {
    const session = await verifyUser(MEMBER_ROLES);
    
    const validation = MemberDepositApplicationSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        // More server-side validation
        const productDoc = await adminDb.collection('depositProducts').doc(validation.data.productId).get();
        if (!productDoc.exists) {
            return { success: false, error: 'Selected product does not exist.' };
        }
        const product = productDoc.data() as DepositProduct;
        if (validation.data.principalAmount < product.minDeposit || validation.data.principalAmount > product.maxDeposit) {
            return { success: false, error: `Deposit amount must be between ₹${product.minDeposit} and ₹${product.maxDeposit}.` };
        }
        if (!product.terms.some(t => t.durationMonths === validation.data.term.durationMonths && t.interestRate === validation.data.term.interestRate)) {
            return { success: false, error: 'Selected term is not valid for this product.' };
        }
        
        const newApplication = {
            userId: session.uid,
            productId: validation.data.productId,
            principalAmount: validation.data.principalAmount,
            term: validation.data.term,
            status: 'pending' as const,
            applicationDate: new Date().toISOString(),
        };

        await adminDb.collection('depositApplications').add(newApplication);

        revalidatePath('/admin/deposits'); // To show up in admin panel
        revalidatePath('/dashboard');
        return { success: true };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function getDepositApplications(): Promise<DepositApplication[]> {
    await verifyUser(ADMIN_ROLES);
    const snapshot = await adminDb.collection('depositApplications').where('status', '==', 'pending').get();
    
    const applications = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const productDoc = await adminDb.collection('depositProducts').doc(data.productId).get();
        
        return {
            id: doc.id,
            ...data,
            userName: userDoc.data()?.name || 'Unknown User',
            productName: productDoc.data()?.name || 'Unknown Product',
            applicationDate: new Date(data.applicationDate).toLocaleDateString(),
        } as DepositApplication;
    }));
    
    return applications;
}

function generateDepositAccountNumber(): string {
    const prefix = 'DEP';
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}${timestamp}${randomSuffix}`;
}

export async function approveDepositApplication(applicationId: string) {
    const session = await verifyUser(ADMIN_ROLES);
    const appRef = adminDb.collection('depositApplications').doc(applicationId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const appDoc = await transaction.get(appRef);
            if (!appDoc.exists) {
                throw new Error("Application not found.");
            }
            const appData = appDoc.data() as Omit<DepositApplication, 'id' | 'userName' | 'productName' | 'applicationDate'> & { applicationDate: string };

            if (appData.status !== 'pending') {
                throw new Error("This application has already been processed.");
            }

            const productDoc = await transaction.get(adminDb.collection('depositProducts').doc(appData.productId));
            if (!productDoc.exists) {
                throw new Error("Associated product not found.");
            }
            const productData = productDoc.data() as DepositProduct;

            // Calculate maturity
            const startDate = new Date();
            const maturityDate = addDays(startDate, appData.term.durationMonths * 30); // Approximation
            // Simple interest for FD, can be expanded for compounding
            const interestEarned = (appData.principalAmount * (appData.term.interestRate / 100) * (appData.term.durationMonths / 12));
            const maturityAmount = appData.principalAmount + interestEarned;
            
            const newActiveDeposit: Omit<ActiveDeposit, 'id' | 'userName' | 'productName'> = {
                userId: appData.userId,
                accountNumber: generateDepositAccountNumber(),
                principalAmount: appData.principalAmount,
                maturityAmount: parseFloat(maturityAmount.toFixed(2)),
                interestRate: appData.term.interestRate,
                termMonths: appData.term.durationMonths,
                startDate: startDate.toISOString(),
                maturityDate: maturityDate.toISOString(),
                status: 'active',
            };

            // Create active deposit
            const newDepositRef = adminDb.collection('activeDeposits').doc();
            transaction.set(newDepositRef, newActiveDeposit);
            
            // Update application status
            transaction.update(appRef, { status: 'approved', approvedBy: session.uid, approvalDate: new Date().toISOString() });
        });

        revalidatePath('/admin/deposits');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectDepositApplication(applicationId: string) {
    await verifyUser(ADMIN_ROLES);
    try {
        await adminDb.collection('depositApplications').doc(applicationId).update({
            status: 'rejected'
        });
        revalidatePath('/admin/deposits');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// Active Deposits
export async function getActiveDeposits(): Promise<ActiveDeposit[]> {
    await verifyUser(ADMIN_ROLES);
    const snapshot = await adminDb.collection('activeDeposits').orderBy('startDate', 'desc').get();
    
    const deposits = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        
        return {
            id: doc.id,
            ...data,
            userName: userDoc.data()?.name || 'Unknown User',
            startDate: new Date(data.startDate).toLocaleDateString(),
            maturityDate: new Date(data.maturityDate).toLocaleDateString(),
        } as ActiveDeposit;
    }));
    
    return deposits;
}
