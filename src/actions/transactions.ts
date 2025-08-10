
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import type { Transaction } from '@/lib/definitions';
import { type SavingsAccount } from './savings';
import Papa from 'papaparse';

const TELLER_ROLES = ['admin', 'branch_manager', 'teller', 'accountant'];

async function verifyTeller() {
  const session = await getSession();
  if (!session || !TELLER_ROLES.includes(session.role)) {
    throw new Error('Not authorized for teller operations');
  }
  return session;
}

export async function createTransaction(prevState: any, formData: FormData) {
    const session = await verifyTeller();
    
    const accountId = formData.get('accountId') as string;
    const type = formData.get('type') as 'credit' | 'debit';
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!accountId || !type || isNaN(amount) || amount <= 0 || !description) {
        return { success: false, error: 'Invalid transaction details provided.' };
    }

    const accountRef = adminDb.collection('savingsAccounts').doc(accountId);

    try {
        const newTransaction = await adminDb.runTransaction(async (t) => {
            const accountDoc = await t.get(accountRef);
            if (!accountDoc.exists) {
                throw new Error('Savings account not found.');
            }

            const accountData = accountDoc.data() as SavingsAccount;

            if (type === 'debit' && accountData.balance < amount) {
                throw new Error('Insufficient balance for this withdrawal.');
            }

            const newBalance = type === 'credit' 
                ? FieldValue.increment(amount) 
                : FieldValue.increment(-amount);

            t.update(accountRef, { balance: newBalance });

            const transactionData = {
                accountId,
                userId: accountData.userId,
                type,
                amount,
                description,
                date: new Date().toISOString(),
                tellerId: session.uid,
                status: 'completed',
                balanceBefore: accountData.balance,
                balanceAfter: accountData.balance + (type === 'credit' ? amount : -amount)
            };
            
            const transactionRef = adminDb.collection('transactions').doc();
            t.set(transactionRef, transactionData);

            return {
                id: transactionRef.id,
                ...transactionData,
                accountNumber: accountData.accountNumber,
                userName: accountData.userName,
            };
        });

        revalidatePath('/admin/transactions');
        return { success: true, transaction: newTransaction };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function getTransactionHistory(filters: { accountId?: string; type?: string; limit?: number }): Promise<Transaction[]> {
    await verifyTeller();

    let query: admin.firestore.Query = adminDb.collection('transactions');

    if (filters.accountId) {
        query = query.where('accountId', '==', filters.accountId);
    }
    if (filters.type) {
        query = query.where('type', '==', filters.type);
    }

    query = query.orderBy('date', 'desc');

    if (filters.limit) {
        query = query.limit(filters.limit);
    }
    
    const snapshot = await query.get();
    const transactions = await Promise.all(snapshot.docs.map(async doc => {
        const data = doc.data();
        // This could be optimized by storing userName/accountNumber on the transaction doc itself.
        const accountDoc = await adminDb.collection('savingsAccounts').doc(data.accountId).get();
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const tellerDoc = await adminDb.collection('users').doc(data.tellerId).get();

        return {
            id: doc.id,
            ...data,
            accountNumber: accountDoc.data()?.accountNumber || 'N/A',
            userName: userDoc.data()?.name || 'N/A',
            tellerName: tellerDoc.data()?.name || 'N/A',
            date: new Date(data.date).toLocaleString(),
        } as Transaction;
    }));

    return transactions;
}


export async function reconcileBankStatement(csvContent: string) {
    await verifyTeller();
    
    const parseResult = Papa.parse(csvContent, { header: true, skipEmptyLines: true });

    if (parseResult.errors.length > 0) {
        return { success: false, error: `CSV Parsing Error: ${parseResult.errors[0].message}` };
    }

    const statementTransactions = parseResult.data as { Date: string; Description: string; Amount: string }[];
    
    // In a real scenario, you would fetch system transactions for the given date range
    // and perform a matching algorithm (e.g., by amount and date proximity).
    // For this example, we'll just simulate a simple reconciliation.
    const results = {
        matched: 0,
        unmatched: 0,
        discrepancies: [] as any[],
    };

    for (const stmtTx of statementTransactions) {
        // Dummy matching logic
        if (parseFloat(stmtTx.Amount) > 0) {
            results.matched++;
        } else {
            results.unmatched++;
            results.discrepancies.push({
                description: stmtTx.Description,
                amount: stmtTx.Amount,
                reason: 'No matching transaction found in system.'
            });
        }
    }
    
    revalidatePath('/admin/transactions');
    return { success: true, results };
}

