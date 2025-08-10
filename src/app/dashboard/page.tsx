
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
import { UserNav } from '@/components/user-nav';
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
  
  return (
    <>
      <header className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.name || 'member'}!</p>
        </div>
         <div className="flex items-center gap-4">
            <UserNav />
        </div>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Button asChild className="w-full">
            <Link href="/dashboard/apply-loan">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Apply for Loan
            </Link>
          </Button>
           <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/apply-deposit">
               <PlusCircle className="mr-2 h-4 w-4"/>
               Make a Deposit
            </Link>
          </Button>
          {societyConfig.upiPaymentLink && (
            <Button asChild variant="secondary" className="w-full">
              <a href={societyConfig.upiPaymentLink} target="_blank" rel="noopener noreferrer">
                <LinkIcon className="mr-2 h-4 w-4"/>
                Pay with UPI
              </a>
            </Button>
          )}
        </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="accounts"><Landmark className="mr-2 h-4 w-4" /> Savings Accounts</TabsTrigger>
          <TabsTrigger value="deposits"><DollarSign className="mr-2 h-4 w-4" /> Fixed Deposits</TabsTrigger>
          <TabsTrigger value="loans"><CreditCard className="mr-2 h-4 w-4" /> Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Savings Account Overview</CardTitle>
              <CardDescription>Your savings accounts and recent transactions.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid gap-4 md:grid-cols-2">
                {savingsAccounts.length > 0 ? savingsAccounts.map(account => (
                  <Card key={account.id}>
                    <CardHeader>
                      <CardTitle>{account.schemeName}</CardTitle>
                      <CardDescription>{account.accountNumber}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">₹{account.balance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
                      <Badge className="mt-1">{account.status}</Badge>
                    </CardContent>
                  </Card>
                )) : <p className="text-muted-foreground col-span-2">No savings accounts found.</p>}
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Recent Transactions</h3>
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
                        <TableCell>{tx.date}</TableCell>
                        <TableCell className="font-medium">{tx.description}</TableCell>
                        <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}₹{Math.abs(tx.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="text-center">No recent transactions found.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
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
                  )) : <TableRow><TableCell colSpan={5} className="text-center">No active deposits found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="loans">
          <Card>
            <CardHeader>
              <CardTitle>Your Loans</CardTitle>
              <CardDescription>Manage your loan accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account No.</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>EMI</TableHead>
                    <TableHead>Interest Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.length > 0 ? activeLoans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono">{loan.accountNumber}</TableCell>
                      <TableCell>₹{loan.principal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>₹{loan.outstandingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>₹{loan.emiAmount.toFixed(2)}</TableCell>
                      <TableCell>{loan.interestRate.toFixed(2)}%</TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={5} className="text-center">No active loans found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
