
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Users, Clock, Landmark, PiggyBank, BadgePercent, Wallet, ArrowLeftRight } from 'lucide-react';
import { getAllMembers } from '@/actions/users';
import { getActiveDeposits } from '@/actions/deposits';
import { getActiveLoans } from '@/actions/loans';
import { getLoanAgingReport } from '@/actions/reports';
import { getChartOfAccounts } from '@/actions/accounting';
import { getTransactionHistory } from '@/actions/transactions';
import { differenceInHours } from 'date-fns';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

async function getDashboardStats() {
    try {
        const [
            members, 
            deposits, 
            loans, 
            loanAging,
            chartOfAccounts,
            transactions
        ] = await Promise.all([
            getAllMembers(),
            getActiveDeposits(),
            getActiveLoans(),
            getLoanAgingReport(),
            getChartOfAccounts(),
            getTransactionHistory({ limit: 100 }) // Fetch recent transactions
        ]);

        const totalMembers = members.length;
        const totalDeposits = deposits.reduce((sum, d) => sum + d.principalAmount, 0);
        const outstandingLoans = loans.reduce((sum, l) => sum + l.outstandingBalance, 0);
        
        const delinquentLoans = loanAging.filter(l => l.status !== 'Performing').length;
        const delinquencyRate = loans.length > 0 ? (delinquentLoans / loans.length) * 100 : 0;
        
        const cashAccount = chartOfAccounts.find(acc => acc.id === '1010'); // 'Cash on Hand'
        const cashInHand = cashAccount?.balance || 0;

        const now = new Date();
        const dailyTransactions = transactions.filter(t => differenceInHours(now, new Date(t.date)) <= 24).length;

        return {
            totalMembers,
            totalDeposits,
            outstandingLoans,
            delinquencyRate,
            cashInHand,
            dailyTransactions,
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        // Return zeroed-out stats on error
        return {
            totalMembers: 0,
            totalDeposits: 0,
            outstandingLoans: 0,
            delinquencyRate: 0,
            cashInHand: 0,
            dailyTransactions: 0,
        };
    }
}


export default async function AdminPage() {
  const session = await getSession();

  if (!session || !ADMIN_ROLES.includes(session.role)) {
    redirect('/dashboard');
  }

  const stats = await getDashboardStats();

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your cooperative's status.</p>
      </header>
      
      <Alert className="bg-primary/5 border-primary/20">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary capitalize">Welcome, {session.role.replace('_', ' ')}</AlertTitle>
        <AlertDescription>
          You are logged in as {session.name || session.email}. You can manage the application from this control center.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">All registered members</p>
          </CardContent>
        </Card>
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalDeposits.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Total member savings & deposits</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
            <Landmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.outstandingLoans.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Total loan balance to be collected</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loan Delinquency</CardTitle>
            <BadgePercent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.delinquencyRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">Percentage of loans with overdue payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash In Hand</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.cashInHand.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">From General Ledger Account '1010'</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Transactions</CardTitle>
            <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.dailyTransactions}</div>
            <p className="text-xs text-muted-foreground">Transactions recorded in the last 24 hours</p>
          </CardContent>
        </Card>
      </div>
      
    </div>
  );
}
