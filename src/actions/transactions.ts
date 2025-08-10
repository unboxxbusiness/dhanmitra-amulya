
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import type { Transaction } from '@/lib/definitions';
import { type SavingsAccount } from './savings';
import Papa from 'papaparse';
import { postJournalEntry } from './accounting';
import type * as admin from 'firebase-admin';
import { ADMIN_ROLES } from '@/lib/definitions';

const TELLER_ROLES = [...ADMIN_ROLES];
const MEMBER_AND_TELLER_ROLES = [...TELLER_ROLES, 'member'];

async function verifyUser(roles: string[]) {
    const session = await getSession();
    if (!session || !roles.includes(session.role)) {
        throw new Error('Not authorized for this operation');
    }
    return session;
}

export async function createTransaction(prevState: any, formData: FormData) {
    const session = await verifyUser(TELLER_ROLES);
    
    const accountId = formData.get('accountId') as string;
    const type = formData.get('type') as 'credit' | 'debit';
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!accountId || !type || isNaN(amount) || amount <= 0 || !description) {
        return { success: false, error: 'Invalid transaction details provided.' };
    }

    const accountRef = adminDb.collection('savingsAccounts').doc(accountId);
    const transactionId = adminDb.collection('transactions').doc().id;

    try {
        const newTransactionData = await adminDb.runTransaction(async (t) => {
            const accountDoc = await t.get(accountRef);
            if (!accountDoc.exists) {
                throw new Error('Savings account not found.');
            }

            const accountData = accountDoc.data() as SavingsAccount;

            if (type === 'debit' && accountData.balance < amount) {
                throw new Error('Insufficient balance for this withdrawal.');
            }
            
            const newBalance = type === 'credit' 
                ? accountData.balance + amount
                : accountData.balance - amount;

            t.update(accountRef, { balance: newBalance });

            const transactionData: Omit<Transaction, 'id'|'accountNumber'|'userName'|'tellerName'> = {
                accountId,
                userId: accountData.userId,
                type,
                amount,
                description,
                date: new Date().toISOString(),
                tellerId: session.uid,
                status: 'completed',
                balanceBefore: accountData.balance,
                balanceAfter: newBalance
            };
            
            const transactionRef = adminDb.collection('transactions').doc(transactionId);
            t.set(transactionRef, transactionData);

            // --- Auto-post to General Ledger ---
            const ledgerEntries = type === 'credit' 
                ? [ // Member deposits cash
                    { accountId: '1010', debit: amount, credit: 0 }, // Debit Cash
                    { accountId: '2010', debit: 0, credit: amount }, // Credit Member Savings
                ]
                : [ // Member withdraws cash
                    { accountId: '2010', debit: amount, credit: 0 }, // Debit Member Savings
                    { accountId: '1010', debit: 0, credit: amount }, // Credit Cash
                ];

            await postJournalEntry(t, {
                date: new Date(),
                description: `Teller transaction: ${description}`,
                entries: ledgerEntries,
                relatedTransactionId: transactionId
            });
            // --- End GL Posting ---

            return {
                id: transactionId,
                ...transactionData,
                accountNumber: accountData.accountNumber,
                userName: accountData.userName,
                tellerName: session.name, // Add teller name from session
            };
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/accounting'); // Revalidate accounting page as well
        return { success: true, transaction: newTransactionData };

    } catch (error: any) {
        return { success: false, error: error.message };
    }
}


export async function getTransactionHistory(filters: { accountId?: string; type?: string; limit?: number; startDate?: string; endDate?: string, userId?: string }): Promise<Transaction[]> {
    const session = await verifyUser(MEMBER_AND_TELLER_ROLES);

    let query: admin.firestore.Query = adminDb.collection('transactions');

    if (filters.accountId) {
        query = query.where('accountId', '==', filters.accountId);
    }
    // If a non-admin is making the request, scope it to their user ID for security.
    if (session.role === 'member') {
        query = query.where('userId', '==', session.uid);
    } else if (filters.userId) {
        query = query.where('userId', '==', filters.userId);
    }

    if (filters.type) {
        query = query.where('type', '==', filters.type);
    }

    if (filters.startDate) {
        query = query.where('date', '>=', new Date(filters.startDate).toISOString());
    }
    if (filters.endDate) {
        // Add 1 day to the end date to include the whole day
        const endDate = new Date(filters.endDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.where('date', '<', endDate.toISOString());
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
        const tellerDoc = data.tellerId ? await adminDb.collection('users').doc(data.tellerId).get() : null;

        return {
            id: doc.id,
            ...data,
            accountNumber: accountDoc.data()?.accountNumber || 'N/A',
            userName: userDoc.data()?.name || 'N/A',
            tellerName: tellerDoc?.data()?.name || 'System',
            date: new Date(data.date).toLocaleString(),
        } as Transaction;
    }));

    return transactions;
}


export async function reconcileBankStatement(csvContent: string) {
    await verifyUser(TELLER_ROLES);
    
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
    
    revalidatePath('/admin/integrations');
    return { success: true, results };
}


export async function exportTransactionsToCsv(filters: { accountId?: string, startDate?: string, endDate?: string }): Promise<string> {
    const session = await getSession();
    if (!session) throw new Error("Not authenticated");

    const transactions = await getTransactionHistory({ ...filters, userId: session.uid });

    const csvData = transactions.map(tx => ({
        "Date": tx.date,
        "Description": tx.description,
        "Debit": tx.type === 'debit' ? tx.amount.toFixed(2) : '',
        "Credit": tx.type === 'credit' ? tx.amount.toFixed(2) : '',
        "Balance": tx.balanceAfter.toFixed(2),
    }));

    return Papa.unparse(csvData);
}
