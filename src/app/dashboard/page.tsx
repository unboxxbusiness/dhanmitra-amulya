
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark, DollarSign, CreditCard, Receipt, PlusCircle, Link as LinkIcon, Wallet, PiggyBank } from 'lucide-react';
import Link from 'next/link';
import { getMemberFinancials } from '@/actions/users';
import { getSocietyConfig } from '@/actions/settings';
import { Separator } from '@/components/ui/separator';
import React from 'react';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const [financialData, societyConfig] = await Promise.all([
    getMemberFinancials(),
    getSocietyConfig(),
  ]);
  
  const { savingsAccounts, activeLoans, activeDeposits, recentTransactions } = financialData;

  const upiPaymentLink = (amount: number) => societyConfig.upiId 
    ? `upi://pay?pa=${societyConfig.upiId}&pn=${encodeURIComponent(societyConfig.name)}&am=${amount.toFixed(2)}&cu=INR` 
    : '#';

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalOutstandingLoan = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalDeposits = activeDeposits.reduce((sum, deposit) => sum + deposit.principalAmount, 0);
  
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.name || 'member'}!</h1>
        <p className="text-muted-foreground">Here’s a summary of your accounts and recent activity.</p>
      </header>
      
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Savings</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSavings.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Across {savingsAccounts.length} account(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalOutstandingLoan.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
            <p className="text-xs text-muted-foreground">Across {activeLoans.length} loan(s)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Deposits</CardTitle>
            <PiggyBank className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDeposits.toLocaleString('en-IN', {maximumFractionDigits: 2})}</div>
             <p className="text-xs text-muted-foreground">Across {activeDeposits.length} deposit(s)</p>
          </CardContent>
        </Card>
      </div>

       {/* Action Buttons */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild className="w-full py-6 text-base">
            <Link href="/dashboard/apply-loan">
              <PlusCircle className="mr-2 h-5 w-5"/>
              Apply for a New Loan
            </Link>
          </Button>
           <Button asChild variant="secondary" className="w-full py-6 text-base">
            <Link href="/dashboard/apply-deposit">
               <PlusCircle className="mr-2 h-5 w-5"/>
               Open a New Deposit
            </Link>
          </Button>
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column for accounts */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Savings Accounts */}
          <section id="accounts">
             <Card>
              <CardHeader>
                <CardTitle>Savings Accounts</CardTitle>
                <CardDescription>Your primary savings and transaction accounts.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  {savingsAccounts.length > 0 ? savingsAccounts.map(account => (
                    <Card key={account.id} className="bg-background">
                      <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{account.schemeName}</CardTitle>
                          <CardDescription>{account.accountNumber}</CardDescription>
                        </div>
                        <Badge variant="outline">{account.status}</Badge>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Current Balance</p>
                        <p className="text-3xl font-bold">₹{account.balance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                      </CardContent>
                    </Card>
                  )) : <p className="text-muted-foreground p-4 text-center">No savings accounts found.</p>}
              </CardContent>
            </Card>
          </section>

          {/* Loan Accounts */}
           <section id="loans">
            <Card>
              <CardHeader>
                <CardTitle>Loan Accounts</CardTitle>
                <CardDescription>Manage your loan accounts and repayments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account No.</TableHead>
                      <TableHead>Outstanding</TableHead>
                      <TableHead>Next EMI</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeLoans.length > 0 ? activeLoans.map(loan => (
                      <TableRow key={loan.id}>
                        <TableCell className="font-mono">{loan.accountNumber}</TableCell>
                        <TableCell>₹{loan.outstandingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                        <TableCell>₹{loan.emiAmount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" disabled={!societyConfig.upiId} title={!societyConfig.upiId ? "UPI payment is not configured by the admin" : "Pay via UPI"}>
                              <a href={upiPaymentLink(loan.emiAmount)} target="_blank" rel="noopener noreferrer">
                                  <LinkIcon className="mr-2 h-4 w-4" />
                                  Repay EMI
                              </a>
                          </Button>
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No active loans found.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>

           {/* Deposit Accounts */}
            <section id="deposits">
             <Card>
              <CardHeader>
                <CardTitle>Deposit Accounts</CardTitle>
                <CardDescription>Your term deposit (FD/RD) investments.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account No.</TableHead>
                      <TableHead>Principal</TableHead>
                      <TableHead>Maturity Date</TableHead>
                      <TableHead>Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeDeposits.length > 0 ? activeDeposits.map(deposit => (
                      <TableRow key={deposit.id}>
                        <TableCell className="font-mono">{deposit.accountNumber}</TableCell>
                        <TableCell>₹{deposit.principalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                         <TableCell>{deposit.maturityDate}</TableCell>
                        <TableCell>{deposit.interestRate.toFixed(2)}%</TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No active deposits found.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Side column for recent transactions */}
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your last 10 transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                     <div className="space-y-4">
                        {recentTransactions.length > 0 ? recentTransactions.map((tx, index) => (
                          <React.Fragment key={tx.id}>
                            <div className="flex items-center">
                                <div className="flex-grow">
                                    <p className="font-medium text-sm">{tx.description}</p>
                                    <p className="text-xs text-muted-foreground">{tx.date}</p>
                                </div>
                                <div className={`font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                  {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN')}
                                </div>
                            </div>
                            {index < recentTransactions.length - 1 && <Separator />}
                          </React.Fragment>
                        )) : <div className="text-center text-muted-foreground py-10">No recent transactions found.</div>}
                     </div>
                </CardContent>
                <CardFooter>
                    <Button asChild variant="secondary" className="w-full">
                        <Link href="/dashboard/payment-history">View All History</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
