
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { FieldValue, type Transaction as FirestoreTransaction } from 'firebase-admin/firestore';
import type { ChartOfAccount, JournalEntry, JournalEntryDetail } from '@/lib/definitions';
import { revalidatePath } from 'next/cache';

const ACCOUNTING_ROLES = ['admin', 'treasurer', 'accountant', 'auditor'];

async function verifyAccountant() {
  const session = await getSession();
  if (!session || !ACCOUNTING_ROLES.includes(session.role)) {
    throw new Error('Not authorized for accounting operations');
  }
  return session;
}

export async function getChartOfAccounts(): Promise<ChartOfAccount[]> {
    await verifyAccountant();
    const snapshot = await adminDb.collection('chartOfAccounts').orderBy('id').get();
    return snapshot.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name,
        type: doc.data().type,
        balance: doc.data().balance,
    } as ChartOfAccount));
}

export async function getJournalEntries(limit = 50): Promise<JournalEntry[]> {
    await verifyAccountant();
    const snapshot = await adminDb.collection('journalEntries').orderBy('date', 'desc').limit(limit).get();
    
    // In a real app, you might cache the chart of accounts to avoid repeated lookups.
    const coaSnapshot = await adminDb.collection('chartOfAccounts').get();
    const coaMap = new Map(coaSnapshot.docs.map(doc => [doc.id, doc.data().name]));

    const entries: JournalEntry[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            date: new Date(data.date).toLocaleString(),
            description: data.description,
            entries: data.entries.map((e: JournalEntryDetail) => ({
                ...e,
                accountName: coaMap.get(e.accountId) || 'Unknown Account',
            })),
        };
    });

    return entries;
}

export async function getTrialBalance() {
    await verifyAccountant();
    const accounts = await getChartOfAccounts();
    let totalDebits = 0;
    let totalCredits = 0;

    const balanceSheet = accounts.map(acc => {
        let debit = 0;
        let credit = 0;
        
        // Based on accounting principles (DEAD: Debits increase Expenses, Assets, Dividends)
        if (['Asset', 'Expense'].includes(acc.type)) {
            if (acc.balance >= 0) debit = acc.balance;
            else credit = -acc.balance;
        } else { // (CLIC: Credits increase Liabilities, Income, Capital)
            if (acc.balance >= 0) credit = acc.balance;
            else debit = -acc.balance;
        }
        
        totalDebits += debit;
        totalCredits += credit;
        
        return {
            id: acc.id,
            name: acc.name,
            debit: parseFloat(debit.toFixed(2)),
            credit: parseFloat(credit.toFixed(2)),
        }
    });

    return { 
        balances: balanceSheet, 
        totalDebits: parseFloat(totalDebits.toFixed(2)), 
        totalCredits: parseFloat(totalCredits.toFixed(2)),
        isBalanced: totalDebits.toFixed(2) === totalCredits.toFixed(2)
    };
}


// This is an internal function to be used by other server actions within a Firestore transaction
export async function postJournalEntry(
    t: FirestoreTransaction,
    entry: { date: Date; description: string; entries: JournalEntryDetail[], relatedTransactionId?: string }
) {
    const totalDebits = entry.entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredits = entry.entries.reduce((sum, e) => sum + e.credit, 0);

    if (totalDebits.toFixed(4) !== totalCredits.toFixed(4)) {
        throw new Error('Journal entry is unbalanced. Debits must equal credits.');
    }

    // 1. Post the journal entry itself
    const journalRef = adminDb.collection('journalEntries').doc();
    t.set(journalRef, {
        date: entry.date.toISOString(),
        description: entry.description,
        entries: entry.entries,
        relatedTransactionId: entry.relatedTransactionId || null,
    });

    // 2. Update the balances in the Chart of Accounts
    for (const line of entry.entries) {
        const accountRef = adminDb.collection('chartOfAccounts').doc(line.accountId);
        const amountChange = line.debit - line.credit;
        
        // In accounting, assets and expenses have a "debit" normal balance.
        // Liabilities, equity, and revenue have a "credit" normal balance.
        // We add debits and subtract credits.
        t.update(accountRef, {
            balance: FieldValue.increment(amountChange)
        });
    }
}


// A one-time function to seed the Chart of Accounts if it's empty
export async function seedChartOfAccounts() {
    await verifyAccountant();

    const coaRef = adminDb.collection('chartOfAccounts');
    const snapshot = await coaRef.limit(1).get();
    
    if (!snapshot.empty) {
        return { success: false, message: 'Chart of Accounts is not empty.' };
    }

    const initialAccounts: Omit<ChartOfAccount, 'balance'>[] = [
        // Assets
        { id: '1010', name: 'Cash on Hand', type: 'Asset' },
        { id: '1020', name: 'Bank Accounts', type: 'Asset' },
        { id: '1210', name: 'Loans Receivable', type: 'Asset' },
        // Liabilities
        { id: '2010', name: 'Member Savings Accounts', type: 'Liability' },
        { id: '2020', name: 'Fixed Deposits', type: 'Liability' },
        { id: '2210', name: 'Interest Payable', type: 'Liability' },
        // Equity
        { id: '3010', name: 'Member Shares', type: 'Equity' },
        { id: '3020', name: 'Retained Earnings', type: 'Equity' },
        // Revenue
        { id: '4010', name: 'Interest Income from Loans', type: 'Revenue' },
        // Expenses
        { id: '5010', name: 'Interest Expense on Savings', type: 'Expense' },
        { id: '5020', name: 'Salaries and Wages', type: 'Expense' },
    ];

    const batch = adminDb.batch();
    initialAccounts.forEach(acc => {
        const docRef = coaRef.doc(acc.id);
        batch.set(docRef, { ...acc, balance: 0 });
    });

    await batch.commit();
    revalidatePath('/admin/accounting');

    return { success: true, message: 'Chart of Accounts seeded successfully.' };
}
