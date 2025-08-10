
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark, DollarSign, CreditCard, Receipt, PlusCircle, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { getMemberFinancials, type MemberFinancials } from '@/actions/users';
import { getSocietyConfig } from '@/actions/settings';

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
  
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.name || 'member'}!</p>
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button asChild className="w-full py-6 text-base">
            <Link href="/dashboard/apply-loan">
              <PlusCircle className="mr-2 h-5 w-5"/>
              Apply for Loan
            </Link>
          </Button>
           <Button asChild variant="secondary" className="w-full py-6 text-base">
            <Link href="/dashboard/apply-deposit">
               <PlusCircle className="mr-2 h-5 w-5"/>
               Make a Deposit
            </Link>
          </Button>
        </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="accounts"><Landmark className="mr-2 h-4 w-4" /> Savings</TabsTrigger>
          <TabsTrigger value="deposits"><DollarSign className="mr-2 h-4 w-4" /> Deposits</TabsTrigger>
          <TabsTrigger value="loans"><CreditCard className="mr-2 h-4 w-4" /> Loans</TabsTrigger>
          <TabsTrigger value="transactions"><Receipt className="mr-2 h-4 w-4" /> Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Savings Account Overview</CardTitle>
              <CardDescription>Your primary savings and transaction accounts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid gap-4 md:grid-cols-2">
                {savingsAccounts.length > 0 ? savingsAccounts.map(account => (
                  <Card key={account.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{account.schemeName}</CardTitle>
                      <CardDescription>{account.accountNumber}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold">₹{account.balance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      <Badge className="mt-2">{account.status}</Badge>
                    </CardContent>
                  </Card>
                )) : <p className="text-muted-foreground col-span-2 p-4 text-center">No savings accounts found.</p>}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
         <TabsContent value="transactions">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your last 10 transactions across all savings accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Description</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                          <TableRow key={tx.id}>
                            <TableCell className="text-xs">{tx.date}</TableCell>
                            <TableCell className="font-medium">{tx.description}</TableCell>
                            <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                              {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </TableCell>
                          </TableRow>
                        )) : <TableRow><TableCell colSpan={3} className="text-center h-24">No recent transactions found.</TableCell></TableRow>}
                      </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </TabsContent>

        <TabsContent value="deposits">
           <Card>
            <CardHeader>
              <CardTitle>Your Fixed Deposits</CardTitle>
              <CardDescription>Manage your term deposit accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account No.</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDeposits.length > 0 ? activeDeposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-mono">{deposit.accountNumber}</TableCell>
                      <TableCell>₹{deposit.principalAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                       <TableCell>{deposit.maturityDate}</TableCell>
                      <TableCell>{deposit.interestRate.toFixed(2)}%</TableCell>
                      <TableCell><Badge>{deposit.status}</Badge></TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={5} className="text-center h-24">No active deposits found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Your Loans</CardTitle>
              <CardDescription>Manage your loan accounts and repayments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account No.</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Next EMI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.length > 0 ? activeLoans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono">{loan.accountNumber}</TableCell>
                      <TableCell>₹{loan.principal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>₹{loan.outstandingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>₹{loan.emiAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button asChild size="sm" disabled={!societyConfig.upiId}>
                            <a href={upiPaymentLink(loan.emiAmount)} target="_blank" rel="noopener noreferrer">
                                <LinkIcon className="mr-2 h-4 w-4" />
                                Repay EMI
                            </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={5} className="text-center h-24">No active loans found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
