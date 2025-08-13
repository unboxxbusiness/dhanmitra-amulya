
'use server';

import { adminDb } from '@/lib/firebase/server';
import { getSession } from '@/lib/auth';
import { ADMIN_ROLES } from '@/lib/definitions';
import { endOfMonth, format, startOfMonth, subMonths } from 'date-fns';

async function verifyAdmin() {
  const session = await getSession();
  if (!session || !ADMIN_ROLES.includes(session.role)) {
    throw new Error('Not authorized for this action');
  }
  return session;
}

export async function getMemberGrowthData() {
    await verifyAdmin();

    const usersSnapshot = await adminDb.collection('users')
        .where('role', '==', 'member')
        .orderBy('createdAt', 'asc')
        .get();

    const monthlyCounts: { [key: string]: number } = {};

    usersSnapshot.docs.forEach(doc => {
        const createdAt = new Date(doc.data().createdAt);
        const monthKey = format(createdAt, 'yyyy-MM');
        if (!monthlyCounts[monthKey]) {
            monthlyCounts[monthKey] = 0;
        }
        monthlyCounts[monthKey]++;
    });

    const sortedMonths = Object.keys(monthlyCounts).sort();
    let cumulativeTotal = 0;
    const chartData = sortedMonths.map(monthKey => {
        cumulativeTotal += monthlyCounts[monthKey];
        return {
            month: format(new Date(`${monthKey}-01`), 'MMM yy'),
            'New Members': monthlyCounts[monthKey],
            'Total Members': cumulativeTotal,
        };
    });

    return chartData;
}


export async function getLoanDepositTrendData() {
    await verifyAdmin();
    const trendData: { [key: string]: { loans: number, deposits: number } } = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, 'yyyy-MM');
        trendData[monthKey] = { loans: 0, deposits: 0 };
    }

    const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));

    const loansSnapshot = await adminDb.collection('activeLoans')
        .where('disbursalDate', '>=', twelveMonthsAgo.toISOString())
        .get();
        
    loansSnapshot.forEach(doc => {
        const loan = doc.data();
        const monthKey = format(new Date(loan.disbursalDate), 'yyyy-MM');
        if (trendData[monthKey]) {
            trendData[monthKey].loans += loan.principal;
        }
    });

    const depositsSnapshot = await adminDb.collection('activeDeposits')
        .where('startDate', '>=', twelveMonthsAgo.toISOString())
        .get();

    depositsSnapshot.forEach(doc => {
        const deposit = doc.data();
        const monthKey = format(new Date(deposit.startDate), 'yyyy-MM');
         if (trendData[monthKey]) {
            trendData[monthKey].deposits += deposit.principalAmount;
        }
    });
    
    return Object.entries(trendData).map(([monthKey, data]) => ({
        month: format(new Date(`${monthKey}-01`), 'MMM yy'),
        'Loans Disbursed': data.loans,
        'Deposits Made': data.deposits,
    }));
}


export async function getTransactionVolumeData() {
    await verifyAdmin();
    const volumeData: { [key: string]: { credit: number, debit: number } } = {};

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
        const date = subMonths(new Date(), i);
        const monthKey = format(date, 'yyyy-MM');
        volumeData[monthKey] = { credit: 0, debit: 0 };
    }

    const twelveMonthsAgo = startOfMonth(subMonths(new Date(), 11));

    const transactionsSnapshot = await adminDb.collection('transactions')
        .where('date', '>=', twelveMonthsAgo.toISOString())
        .get();

    transactionsSnapshot.forEach(doc => {
        const tx = doc.data();
        const monthKey = format(new Date(tx.date), 'yyyy-MM');
        if (volumeData[monthKey]) {
            if (tx.type === 'credit') {
                volumeData[monthKey].credit += tx.amount;
            } else {
                volumeData[monthKey].debit += tx.amount;
            }
        }
    });

     return Object.entries(volumeData).map(([monthKey, data]) => ({
        month: format(new Date(`${monthKey}-01`), 'MMM yy'),
        'Deposits': data.credit,
        'Withdrawals': data.debit,
    }));
}
