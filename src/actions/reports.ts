
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import type { SavingsAccount } from './savings';
import type { ActiveLoan, ChartOfAccount } from '@/lib/definitions';
import { differenceInDays } from 'date-fns';
import Papa from 'papaparse';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'auditor'];

async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized for reporting');
  }
  return session;
}


// --- Savings Account Report ---
export type SavingsAccountReportData = {
    accountNumber: string;
    userName: string;
    schemeName: string;
    balance: number;
    status: 'Active' | 'Dormant' | 'Closed';
}
export async function getSavingsAccountReport(): Promise<SavingsAccountReportData[]> {
    await verifyAdmin();
    const accountsSnapshot = await adminDb.collection('savingsAccounts').get();

    const reportData = await Promise.all(accountsSnapshot.docs.map(async doc => {
        const data = doc.data() as SavingsAccount;
        // This can be optimized in a real app with cached user/scheme names
        const userDoc = await adminDb.collection('users').doc(data.userId).get();
        const schemeDoc = await adminDb.collection('savingsSchemes').doc(data.schemeId).get();
        return {
            accountNumber: data.accountNumber,
            userName: userDoc.data()?.name || 'N/A',
            schemeName: schemeDoc.data()?.name || 'N/A',
            balance: data.balance,
            status: data.status,
        };
    }));

    return reportData;
}

export async function exportSavingsAccountReport(): Promise<string> {
    const data = await getSavingsAccountReport();
    return Papa.unparse(data);
}

// --- Loan Aging / NPA Report ---

export type LoanAgingReportData = {
    accountNumber: string;
    userName: string;
    principal: number;
    outstandingBalance: number;
    daysOverdue: number;
    status: 'Performing' | 'SMA-0' | 'SMA-1' | 'SMA-2' | 'Sub-Standard' | 'Doubtful' | 'Loss';
}

export async function getLoanAgingReport(): Promise<LoanAgingReportData[]> {
    await verifyAdmin();
    const loansSnapshot = await adminDb.collection('activeLoans').get();

    const reportData: LoanAgingReportData[] = [];
    const today = new Date();

    for (const doc of loansSnapshot.docs) {
        const loan = doc.data() as ActiveLoan;

        const pendingInstallment = loan.repaymentSchedule.find(
            (r) => r.status === 'pending' && new Date(r.dueDate) < today
        );
        
        let daysOverdue = 0;
        if (pendingInstallment) {
            daysOverdue = differenceInDays(today, new Date(pendingInstallment.dueDate));
        }

        let status: LoanAgingReportData['status'] = 'Performing';
        if (daysOverdue > 0 && daysOverdue <= 30) status = 'SMA-0';
        else if (daysOverdue > 30 && daysOverdue <= 60) status = 'SMA-1';
        else if (daysOverdue > 60 && daysOverdue <= 90) status = 'SMA-2';
        else if (daysOverdue > 90 && daysOverdue <= 180) status = 'Sub-Standard';
        else if (daysOverdue > 180 && daysOverdue <= 365) status = 'Doubtful';
        else if (daysOverdue > 365) status = 'Loss';

        // In a real app, userName would likely be stored on the loan doc to avoid this extra read.
        const userDoc = await adminDb.collection('users').doc(loan.userId).get();

        reportData.push({
            accountNumber: loan.accountNumber,
            userName: userDoc.data()?.name || 'N/A',
            principal: loan.principal,
            outstandingBalance: loan.outstandingBalance,
            daysOverdue,
            status,
        });
    }

    return reportData.sort((a,b) => b.daysOverdue - a.daysOverdue);
}

export async function exportLoanAgingReport(): Promise<string> {
    const data = await getLoanAgingReport();
    return Papa.unparse(data);
}


// --- Financial Statements ---

export type PandLReport = {
    revenue: { name: string; balance: number }[];
    expenses: { name: string; balance: number }[];
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
}

export async function getProfitAndLossReport(): Promise<PandLReport> {
    await verifyAdmin();
    const coaSnapshot = await adminDb.collection('chartOfAccounts').get();
    const accounts = coaSnapshot.docs.map(d => d.data() as ChartOfAccount);

    const revenue = accounts.filter(a => a.type === 'Revenue').map(a => ({ name: a.name, balance: a.balance }));
    const expenses = accounts.filter(a => a.type === 'Expense').map(a => ({ name: a.name, balance: a.balance }));

    const totalRevenue = revenue.reduce((sum, acc) => sum + acc.balance, 0);
    const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
    const netProfit = totalRevenue - totalExpenses;

    return { revenue, expenses, totalRevenue, totalExpenses, netProfit };
}


export type BalanceSheetReport = {
    assets: { name: string; balance: number }[];
    liabilities: { name: string; balance: number }[];
    equity: { name: string; balance: number }[];
    totalAssets: number;
    totalLiabilitiesAndEquity: number;
    isBalanced: boolean;
}

export async function getBalanceSheetReport(): Promise<BalanceSheetReport> {
    await verifyAdmin();
    const coaSnapshot = await adminDb.collection('chartOfAccounts').get();
    const accounts = coaSnapshot.docs.map(d => d.data() as ChartOfAccount);

    const assets = accounts.filter(a => a.type === 'Asset').map(a => ({ name: a.name, balance: a.balance }));
    const liabilities = accounts.filter(a => a.type === 'Liability').map(a => ({ name: a.name, balance: a.balance }));
    const equity = accounts.filter(a => a.type === 'Equity').map(a => ({ name: a.name, balance: a.balance }));

    const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
    const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);
    const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

    return {
        assets,
        liabilities,
        equity,
        totalAssets: parseFloat(totalAssets.toFixed(2)),
        totalLiabilitiesAndEquity: parseFloat(totalLiabilitiesAndEquity.toFixed(2)),
        isBalanced: totalAssets.toFixed(2) === totalLiabilitiesAndEquity.toFixed(2),
    };
}
