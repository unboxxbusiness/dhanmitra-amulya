import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark, DollarSign, CreditCard, Receipt, PlusCircle } from 'lucide-react';
import Link from 'next/link';

// In a real application, you would fetch this data from Firestore
// based on the logged-in user's ID.
async function getFinancialData(userId: string) {
  // Replace this with your actual Firestore fetching logic
  console.log(`Fetching data for user: ${userId}`);
  return {
    accounts: [
      { id: '**** **** **** 1234', type: 'Checking', balance: 5250.75, currency: 'USD' },
      { id: '**** **** **** 5678', type: 'Savings', balance: 12800.00, currency: 'USD' },
    ],
    loans: [
      { id: 'LOAN-001', type: 'Personal Loan', principal: 15000, remaining: 7500, interestRate: 5.0, status: 'Active' },
      { id: 'LOAN-002', type: 'Auto Loan', principal: 25000, remaining: 18250.50, interestRate: 4.5, status: 'Active' },
    ],
    deposits: [
        { id: 'DEP-001', type: 'Certificate of Deposit', principal: 10000, maturityDate: '2025-12-01', interestRate: 2.5, status: 'Active' },
    ],
    statements: [
      { id: 'STMT-001', date: '2024-06-30', description: 'June 2024 Statement' },
      { id: 'STMT-002', date: '2024-05-31', description: 'May 2024 Statement' },
    ],
    transactions: [
      { id: 'txn_1', date: '2024-07-15', description: 'Grocery Store', amount: -75.50, type: 'debit' },
      { id: 'txn_2', date: '2024-07-14', description: 'Paycheck Deposit', amount: 2200.00, type: 'credit' },
      { id: 'txn_3', date: '2024-07-12', description: 'Utility Bill Payment', amount: -120.00, type: 'debit' },
    ],
  };
}


export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch financial data for the current user
  const { accounts, loans, deposits, statements, transactions } = await getFinancialData(session.uid);
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Member Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {session.name || 'member'}!</p>
        </div>
         <div className="flex items-center gap-4">
          <Button asChild>
            <Link href="#">
              <PlusCircle className="mr-2 h-4 w-4"/>
              Apply for Loan
            </Link>
          </Button>
           <Button asChild variant="outline">
            <Link href="#">
               <PlusCircle className="mr-2 h-4 w-4"/>
               Make a Deposit
            </Link>
          </Button>
        </div>
      </header>
      
      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="accounts"><Landmark className="mr-2 h-4 w-4" /> Accounts</TabsTrigger>
          <TabsTrigger value="deposits"><DollarSign className="mr-2 h-4 w-4" /> Deposits</TabsTrigger>
          <TabsTrigger value="loans"><CreditCard className="mr-2 h-4 w-4" /> Loans</TabsTrigger>
          <TabsTrigger value="statements"><Receipt className="mr-2 h-4 w-4" /> Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>Your financial summary.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
               <div className="grid gap-4 md:grid-cols-2">
                {accounts.map(account => (
                  <Card key={account.id}>
                    <CardHeader>
                      <CardTitle>{account.type} Account</CardTitle>
                      <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${account.balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</div>
                      <p className="text-xs text-muted-foreground">{account.id}</p>
                    </CardContent>
                  </Card>
                ))}
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
                    {transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell className="font-medium">{tx.description}</TableCell>
                        <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="deposits">
           <Card>
            <CardHeader>
              <CardTitle>Your Deposits</CardTitle>
              <CardDescription>Manage your deposit accounts.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.type}</TableCell>
                      <TableCell>${deposit.principal.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                       <TableCell>{deposit.maturityDate}</TableCell>
                      <TableCell>{deposit.interestRate.toFixed(2)}%</TableCell>
                      <TableCell><Badge>{deposit.status}</Badge></TableCell>
                    </TableRow>
                  ))}
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
                    <TableHead>Loan Type</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Remaining Balance</TableHead>
                    <TableHead>Interest Rate</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.type}</TableCell>
                      <TableCell>${loan.principal.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>${loan.remaining.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>{loan.interestRate.toFixed(2)}%</TableCell>
                      <TableCell><Badge>{loan.status}</Badge></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statements">
          <Card>
            <CardHeader>
              <CardTitle>Your Statements</CardTitle>
              <CardDescription>View and download your monthly statements.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {statements.map(stmt => (
                    <TableRow key={stmt.id}>
                      <TableCell>{stmt.date}</TableCell>
                      <TableCell className="font-medium">{stmt.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Download</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
