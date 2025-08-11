

'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import type { LoanProduct, LoanApplication, LoanApplicationDetails, ActiveLoan, Repayment, RepaymentWithLoanDetails } from '@/lib/definitions';
import { LoanProductSchema, LoanApplicationSchema as MemberLoanApplicationSchema, ADMIN_ROLES } from '@/lib/definitions';
import { FieldValue } from 'firebase-admin/firestore';
import { z } from 'zod';
import Papa from 'papaparse';
import { getNextAccountNumber } from './settings';


const LOAN_VERIFIER_ROLES = ['admin', 'branch_manager', 'auditor'];
const LOAN_APPROVER_ROLES = ['admin', 'branch_manager'];
const MEMBER_ROLES = ['member', ...ADMIN_ROLES];

async function verifyUser(roles: string[]) {
  const session = await getSession();
  if (!session || !roles.includes(session.role)) {
    throw new Error('Not authorized for this action');
  }
  return session;
}

// --- Product Management ---

export async function getLoanProducts(): Promise<LoanProduct[]> {
    await verifyUser(ADMIN_ROLES);
    const snapshot = await adminDb.collection('loanProducts').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanProduct));
}

export async function getAvailableLoanProducts(): Promise<LoanProduct[]> {
    await verifyUser(MEMBER_ROLES);
    const snapshot = await adminDb.collection('loanProducts').orderBy('name').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoanProduct));
}

export async function addLoanProduct(product: LoanProduct) {
    await verifyUser(LOAN_APPROVER_ROLES);
    try {
        const validation = LoanProductSchema.safeParse(product);
        if (!validation.success) {
            throw new Error(validation.error.errors.map(e => e.message).join(', '));
        }
        await adminDb.collection('loanProducts').add(validation.data);
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred. Please try again.' };
    }
}


// --- Application Management ---

export async function applyForLoan(data: z.infer<typeof MemberLoanApplicationSchema>) {
    const session = await verifyUser(MEMBER_ROLES);

    const validation = MemberLoanApplicationSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    try {
        const productDoc = await adminDb.collection('loanProducts').doc(validation.data.productId).get();
        if (!productDoc.exists) {
            return { success: false, error: "Selected product does not exist." };
        }
        const product = productDoc.data() as LoanProduct;
        if (validation.data.termMonths > product.maxTermMonths) {
            return { success: false, error: `Term cannot exceed ${product.maxTermMonths} months.` };
        }

        const newApplication = {
            userId: session.uid,
            productId: validation.data.productId,
            amountRequested: validation.data.amountRequested,
            termMonths: validation.data.termMonths,
            status: 'pending' as const,
            applicationDate: new Date().toISOString(),
        };

        await adminDb.collection('loanApplications').add(newApplication);

        revalidatePath('/admin/loans');
        revalidatePath('/dashboard');
        return { success: true };
        
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred while submitting your application. Please try again.' };
    }
}


export async function getLoanApplications(): Promise<LoanApplicationDetails[]> {
    await verifyUser(ADMIN_ROLES);
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
    const session = await verifyUser(LOAN_VERIFIER_ROLES);
    try {
        await adminDb.collection('loanApplications').doc(applicationId).update({
            status: 'verified',
            verifierId: session.uid,
            verificationDate: new Date().toISOString(),
        });
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred during verification.' };
    }
}

export async function approveLoanApplication(applicationId: string) {
    const session = await verifyUser(LOAN_APPROVER_ROLES);
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
        return { success: false, error: 'An unexpected error occurred during approval.' };
    }
}

export async function rejectLoanApplication(applicationId: string) {
    await verifyUser(LOAN_APPROVER_ROLES);
    try {
        await adminDb.collection('loanApplications').doc(applicationId).update({ status: 'rejected' });
        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: 'An unexpected error occurred while rejecting the application.' };
    }
}

export async function disburseLoan(applicationId: string) {
    const session = await verifyUser(ADMIN_ROLES);
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
                    repaymentId: adminDb.collection('temp').doc().id, // Generate unique ID
                    dueDate: dueDate.toISOString(),
                    amount: parseFloat(emi.toFixed(2)),
                    status: 'pending',
                });
            }
            
            const newAccountNumber = await getNextAccountNumber(transaction, 'loan');

            const newActiveLoan: Omit<ActiveLoan, 'id' | 'userName' | 'productName'> = {
                userId: appData.userId,
                accountNumber: newAccountNumber,
                principal: appData.amountRequested,
                interestRate: productData.interestRate,
                termMonths: appData.termMonths,
                emiAmount: parseFloat(emi.toFixed(2)),
                disbursalDate: disbursalDate.toISOString(),
                outstandingBalance: appData.amountRequested,
                repaymentSchedule: schedule,
            };

            const newLoanRef = adminDb.collection('activeLoans').doc();
            transaction.set(newLoanRef, newActiveLoan);
            transaction.update(appRef, { status: 'disbursed' });
        });

        revalidatePath('/admin/loans');
        return { success: true };
    } catch (error: any) {
        console.error("Disbursal Error:", error);
        return { success: false, error: 'An unexpected error occurred during loan disbursal.' };
    }
}


// --- Active Loans & Repayments ---

export async function getActiveLoans(): Promise<ActiveLoan[]> {
    await verifyUser(ADMIN_ROLES);
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
    await verifyUser(ADMIN_ROLES);
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
                    repaymentId: repayment.repaymentId,
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
    await verifyUser(ADMIN_ROLES);
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
        return { success: false, error: 'An unexpected error occurred while recording the payment.' };
    }
}


// --- Member-facing Actions ---
export async function getMemberLoanHistory(): Promise<RepaymentWithLoanDetails[]> {
  const session = await getSession();
  if (!session) {
      throw new Error("Not authenticated. Please log in.");
  }
  
  const loansSnapshot = await adminDb.collection('activeLoans').where('userId', '==', session.uid).get();

  let allRepayments: RepaymentWithLoanDetails[] = [];

  for (const doc of loansSnapshot.docs) {
    const loan = doc.data() as ActiveLoan;
    
    loan.repaymentSchedule.forEach((repayment, index) => {
      allRepayments.push({
        id: repayment.repaymentId, // Use the unique ID
        loanId: doc.id,
        repaymentId: repayment.repaymentId,
        repaymentIndex: index,
        userName: session.name || 'N/A',
        accountNumber: loan.accountNumber,
        emiAmount: repayment.amount,
        dueDate: new Date(repayment.dueDate).toLocaleDateString(),
        status: repayment.status,
        paymentDate: repayment.paymentDate ? new Date(repayment.paymentDate).toLocaleDateString() : undefined,
      });
    });
  }

  // Sort by due date, descending
  allRepayments.sort((a, b) => new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime());

  return allRepayments;
}

export async function exportMemberLoanHistory(): Promise<string> {
    const session = await verifyUser(MEMBER_ROLES);
    const history = await getMemberLoanHistory();

    const csvData = history.map(item => ({
        "Loan Account": item.accountNumber,
        "Due Date": item.dueDate,
        "Amount": item.emiAmount,
        "Status": item.status,
        "Payment Date": item.paymentDate || 'N/A',
    }));
    
    return Papa.unparse(csvData);
}
