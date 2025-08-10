
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { LoanProduct, LoanApplication, LoanApplicationDetails, ActiveLoan, Repayment, RepaymentWithLoanDetails } from '@/lib/definitions';
import { LoanProductSchema } from '@/lib/definitions';
import { FieldValue } from 'firebase-admin/firestore';


const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant'];
const LOAN_VERIFIER_ROLES = ['admin', 'branch_manager', 'auditor'];
const LOAN_APPROVER_ROLES = ['admin', 'branch_manager'];

async function verifyAdmin(roles: string[] = ADMIN_ROLES) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error('Not authorized for this action');
  }
  return session;
}

// --- Product Management ---

export async function getLoanProducts(): Promise<LoanProduct[]> {
    await verifyAdmin();
    const snapshot = await adminDb.collection('loanProducts').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanProduct));
}

export async function addLoanProduct(product: LoanProduct) {
    await verifyAdmin(LOAN_APPROVER_ROLES);
    try {
        const validation = LoanProductSchema.safeParse(product);
        if (!validation.success) {
            throw new Error(validation.error.errors.map(e => e.message).join(', '));
        }
        await adminDb.collection('loanProducts').add(validation.data);
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


// --- Application Management ---

function generateLoanAccountNumber(): string {
    const prefix = 'LOAN';
    const timestamp = Date.now().toString().slice(-8);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000).toString();
    return `${prefix}${timestamp}${randomSuffix}`;
}

export async function getLoanApplications(): Promise<LoanApplicationDetails[]> {
    await verifyAdmin();
    const snapshot = await adminDb.collection('loanApplications').where('status', 'in', ['pending', 'verified']).get();
    
    const applications = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const productDoc = await adminDb.collection('loanProducts').doc(data.productId).get();
        
        let verifierName, approverName;
        if (data.verifierId) {
            const verifierDoc = await adminDb.collection('users').doc(data.verifierId).get();
            verifierName = verifierDoc.data()?.name || 'Unknown';
        }
        if (data.approverId) {
            const approverDoc = await adminDb.collection('users').doc(data.approverId).get();
            approverName = approverDoc.data()?.name || 'Unknown';
        }

        return {
            id: doc.id,
            ...data,
            userName: userDoc.data()?.name || 'Unknown User',
            productName: productDoc.data()?.name || 'Unknown Product',
            applicationDate: new Date(data.applicationDate).toLocaleDateString(),
            verifierName,
            approverName,
        } as LoanApplicationDetails;
    }));
    
    return applications;
}

export async function verifyLoanApplication(applicationId: string) {
    const session = await verifyAdmin(LOAN_VERIFIER_ROLES);
    try {
        await adminDb.collection('loanApplications').doc(applicationId).update({
            status: 'verified',
            verifierId: session.uid,
            verificationDate: new Date().toISOString(),
        });
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function approveLoanApplication(applicationId: string) {
    const session = await verifyAdmin(LOAN_APPROVER_ROLES);
    const appRef = adminDb.collection('loanApplications').doc(applicationId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const appDoc = await transaction.get(appRef);
            if (!appDoc.exists) throw new Error("Application not found.");
            
            const appData = appDoc.data() as any;
            if (appData.status !== 'verified') throw new Error("Application must be verified before approval.");

            transaction.update(appRef, {
                status: 'approved',
                approverId: session.uid,
                approvalDate: new Date().toISOString(),
            });
        });
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function rejectLoanApplication(applicationId: string) {
    await verifyAdmin(LOAN_APPROVER_ROLES);
    try {
        await adminDb.collection('loanApplications').doc(applicationId).update({ status: 'rejected' });
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function disburseLoan(applicationId: string) {
    const session = await verifyAdmin(ADMIN_ROLES);
    const appRef = adminDb.collection('loanApplications').doc(applicationId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const appDoc = await transaction.get(appRef);
            if (!appDoc.exists) throw new Error("Application not found.");
            
            const appData = appDoc.data() as any;
            if (appData.status !== 'approved') throw new Error("Application must be approved before disbursal.");

            const productDoc = await adminDb.collection('loanProducts').doc(appData.productId).get();
            if (!productDoc.exists) throw new Error("Associated loan product not found.");
            const productData = productDoc.data() as LoanProduct;

            // --- EMI Calculation ---
            const principal = appData.amountRequested;
            const rate = productData.interestRate / 100 / 12; // monthly interest rate
            const term = appData.termMonths;
            const emi = principal * rate * (Math.pow(1 + rate, term) / (Math.pow(1 + rate, term) - 1));

            // --- Repayment Schedule ---
            const schedule: Repayment[] = [];
            let balance = principal;
            const disbursalDate = new Date();

            for (let i = 1; i <= term; i++) {
                const interestComponent = balance * rate;
                const principalComponent = emi - interestComponent;
                balance -= principalComponent;
                
                const dueDate = new Date(disbursalDate);
                dueDate.setMonth(dueDate.getMonth() + i);

                schedule.push({
                    dueDate: dueDate.toISOString(),
                    amount: parseFloat(emi.toFixed(2)),
                    status: 'pending',
                });
            }

            const newActiveLoan: Omit<ActiveLoan, 'id' | 'userName' | 'productName'> = {
                userId: appData.userId,
                accountNumber: generateLoanAccountNumber(),
                principal: appData.amountRequested,
                interestRate: productData.interestRate,
                termMonths: appData.termMonths,
                emiAmount: parseFloat(emi.toFixed(2)),
                disbursalDate: disbursalDate.toISOString(),
                outstandingBalance: appData.amountRequested,
                repaymentSchedule: schedule,
            };

            transaction.set(adminDb.collection('activeLoans').doc(), newActiveLoan);
            transaction.update(appRef, { status: 'disbursed' });
        });

        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        console.error("Disbursal Error:", error);
        return { success: false, error: error.message };
    }
}


// --- Active Loans & Repayments ---

export async function getActiveLoans(): Promise<ActiveLoan[]> {
    await verifyAdmin();
    const snapshot = await adminDb.collection('activeLoans').orderBy('disbursalDate', 'desc').get();
    
    const loans = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const productDoc = await adminDb.collection('loanProducts').doc(data.productId).get();
        
        return {
            id: doc.id,
            ...data,
            userName: userDoc.data()?.name || 'Unknown User',
            productName: productDoc.data()?.name || 'Unknown Product',
            disbursalDate: new Date(data.disbursalDate).toLocaleDateString(),
        } as ActiveLoan;
    }));
    
    return loans;
}


export async function getPendingRepayments(): Promise<RepaymentWithLoanDetails[]> {
    await verifyAdmin();
    const snapshot = await adminDb.collection('activeLoans').get();
    
    let allPendingRepayments: RepaymentWithLoanDetails[] = [];

    for (const doc of snapshot.docs) {
        const loan = doc.data() as ActiveLoan;
        const userDoc = await adminDb.collection('users').doc(loan.userId).get();

        loan.repaymentSchedule.forEach((repayment, index) => {
            if (repayment.status === 'pending') {
                allPendingRepayments.push({
                    id: `${doc.id}_${index}`,
                    loanId: doc.id,
                    repaymentIndex: index,
                    userName: userDoc.data()?.name || 'Unknown',
                    accountNumber: loan.accountNumber,
                    emiAmount: repayment.amount,
                    dueDate: new Date(repayment.dueDate).toLocaleDateString(),
                    status: repayment.status,
                });
            }
        });
    }

    // Sort by due date
    allPendingRepayments.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

    return allPendingRepayments;
}


export async function recordRepayment(loanId: string, repaymentIndex: number) {
    await verifyAdmin();
    const loanRef = adminDb.collection('activeLoans').doc(loanId);

    try {
        await adminDb.runTransaction(async (transaction) => {
            const loanDoc = await transaction.get(loanRef);
            if (!loanDoc.exists) throw new Error("Loan not found.");

            const loanData = loanDoc.data() as ActiveLoan;
            
            // Create a deep copy to modify
            const updatedSchedule = [...loanData.repaymentSchedule];
            const repayment = updatedSchedule[repaymentIndex];

            if (repayment.status !== 'pending') throw new Error("Repayment is not pending.");

            repayment.status = 'paid';
            repayment.paymentDate = new Date().toISOString();
            
            const newOutstandingBalance = loanData.outstandingBalance - repayment.amount;

            // Update the specific repayment and the outstanding balance
            transaction.update(loanRef, {
                repaymentSchedule: updatedSchedule,
                outstandingBalance: FieldValue.increment(-repayment.amount)
            });
        });

        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
