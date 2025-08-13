

'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { FieldValue } from 'firebase-admin/firestore';
import type { Transaction, UserProfile } from '@/lib/definitions';
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
    
    const savingsAccountId = formData.get('savingsAccountId') as string;
    const type = formData.get('type') as 'credit' | 'debit';
    const amount = parseFloat(formData.get('amount') as string);
    const description = formData.get('description') as string;

    if (!savingsAccountId || !type || isNaN(amount) || amount <= 0 || !description) {
        return { success: false, error: 'Invalid transaction details provided. Please check all fields.' };
    }

    const accountRef = adminDb.collection('savingsAccounts').doc(savingsAccountId);
    const transactionId = adminDb.collection('transactions').doc().id;

    try {
        const newTransactionData = await adminDb.runTransaction(async (t) => {
            // --- 1. ALL READS FIRST ---
            const accountDoc = await t.get(accountRef);
            if (!accountDoc.exists) {
                throw new Error('Savings account not found.');
            }
            const accountData = accountDoc.data() as SavingsAccount;

            const userRef = adminDb.collection('users').doc(accountData.userId);
            const userDoc = await t.get(userRef);
            if (!userDoc.exists) {
                throw new Error('Associated member profile not found.');
            }
            const userData = userDoc.data() as UserProfile;

            // Pre-read account documents needed for the journal entry
            const cashAccountRef = adminDb.collection('chartOfAccounts').doc('1010');
            const savingsAccountRef = adminDb.collection('chartOfAccounts').doc('2010');
            const [cashAccountDoc, savingsCoADoc] = await t.getAll(cashAccountRef, savingsAccountRef);
            if (!cashAccountDoc.exists || !savingsCoADoc.exists) {
                throw new Error('Critical Error: A required general ledger account (Cash or Member Savings) is missing.');
            }

            // --- 2. VALIDATION ---
            if (type === 'debit' && accountData.balance < amount) {
                throw new Error('Insufficient balance for this withdrawal.');
            }
            
            // --- 3. ALL WRITES LAST ---
            const newBalance = type === 'credit' 
                ? accountData.balance + amount
                : accountData.balance - amount;

            // Write 1: Update member's savings balance
            t.update(accountRef, { balance: newBalance });

            // Ensure Member ID is included in the description for audit purposes.
            const finalDescription = `${description} for ${userData.name} (${userData.memberId})`;

            const transactionData: Omit<Transaction, 'id'|'userName'|'tellerName'> = {
                savingsAccountId,
                userId: accountData.userId,
                type,
                amount,
                description: finalDescription,
                date: new Date().toISOString(),
                tellerId: session.uid,
                status: 'completed',
                balanceBefore: accountData.balance,
                balanceAfter: newBalance
            };
            
            // Write 2: Create the transaction record
            const transactionRef = adminDb.collection('transactions').doc(transactionId);
            t.set(transactionRef, transactionData);

            // Write 3 & 4: Post to General Ledger
            const ledgerEntries = type === 'credit' 
                ? [ // Member deposits cash
                    { accountId: '1010', debit: amount, credit: 0 }, // Debit Cash
                    { accountId: '2010', debit: 0, credit: amount }, // Credit Member Savings
                ]
                : [ // Member withdraws cash
                    { accountId: '2010', debit: amount, credit: 0 }, // Debit Member Savings
                    { accountId: '1010', debit: 0, credit: amount }, // Credit Cash
                ];
            
            // The postJournalEntry function now only performs writes, which is safe.
            await postJournalEntry(t, {
                date: new Date(),
                description: `Teller transaction: ${description} for Member ID ${userData.memberId}`,
                entries: ledgerEntries,
                relatedTransactionId: transactionId
            });
            
            return {
                id: transactionId,
                ...transactionData,
                userName: userData.name,
                tellerName: session.name || 'N/A',
            };
        });

        revalidatePath('/admin/transactions');
        revalidatePath('/admin/accounting'); // Revalidate accounting page as well
        return { success: true, transaction: newTransactionData };

    } catch (error: any) {
        console.error("Transaction Error:", error);
        return { success: false, error: error.message || 'An unexpected error occurred. Please try again.' };
    }
}


export async function getTransactionHistory(filters: { savingsAccountId?: string; type?: string; limit?: number; startDate?: string; endDate?: string, userId?: string }): Promise<Transaction[]> {
    const session = await verifyUser(MEMBER_AND_TELLER_ROLES);
    let query: admin.firestore.Query = adminDb.collection('transactions');
    let userAccountIds: string[] = [];

    // Security check and query modification
    if (session.role === 'member') {
        // A member can only see their own transactions.
        const userAccountsSnapshot = await adminDb.collection('savingsAccounts').where('userId', '==', session.uid).get();
        if (userAccountsSnapshot.empty) return [];
        
        userAccountIds = userAccountsSnapshot.docs.map(doc => doc.id);
        query = query.where('savingsAccountId', 'in', userAccountIds);

    } else if (filters.userId) {
        // An admin is filtering by a specific user.
        const userAccountsSnapshot = await adminDb.collection('savingsAccounts').where('userId', '==', filters.userId).get();
        if (userAccountsSnapshot.empty) return [];

        userAccountIds = userAccountsSnapshot.docs.map(doc => doc.id);
        query = query.where('savingsAccountId', 'in', userAccountIds);
    }
    
    // Apply account-based filters
    if (filters.savingsAccountId) {
        query = query.where('savingsAccountId', '==', filters.savingsAccountId);
    } 
    
    // Apply other filters
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
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const tellerDoc = data.tellerId ? await adminDb.collection('users').doc(data.tellerId).get() : null;

        return {
            id: doc.id,
            ...data,
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


export async function exportTransactionsToCsv(filters: { savingsAccountId?: string, startDate?: string, endDate?: string }): Promise<string> {
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
