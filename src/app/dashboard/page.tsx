
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark, DollarSign, CreditCard, Receipt, PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { adminDb } from '@/lib/firebase/server';
import { UserNav } from '@/components/user-nav';

type Account = {
  id: string;
  type: string;
  balance: number;
  currency: string;
}

type Loan = {
  id: string;
  type: string;
  principal: number;
  remaining: number;
  interestRate: number;
  status: string;
}

type Deposit = {
  id: string;
  type: string;
  principal: number;
  maturityDate: string;
  interestRate: number;
  status: string;
}

type Statement = {
    id: string;
    date: string;
    description: string;
}

type Transaction = {
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'credit' | 'debit';
}

type FinancialData = {
    accounts: Account[];
    loans: Loan[];
    deposits: Deposit[];
    statements: Statement[];
    transactions: Transaction[];
}

// In a real application, you would fetch this data from Firestore
// based on the logged-in user's ID.
async function getFinancialData(userId: string): Promise<FinancialData> {
  // This is where you would fetch data from Firestore.
  // For now, we return empty arrays to remove mock data.
  console.log(`Fetching data for user: ${userId}`);
  
  const financialData: FinancialData = {
      accounts: [],
      loans: [],
      deposits: [],
      statements: [],
      transactions: [],
  };

  try {
    const financialDoc = await adminDb.collection('financials').doc(userId).get();
    if (financialDoc.exists) {
        const data = financialDoc.data();
        if(data) {
          financialData.accounts = data.accounts || [];
          financialData.loans = data.loans || [];
          financialData.deposits = data.deposits || [];
          financialData.statements = data.statements || [];
          financialData.transactions = data.transactions || [];
        }
    }
  } catch (error) {
    console.error("Error fetching financial data:", error);
  }
  
  return financialData;
}


export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  // Fetch financial data for the current user
  const { accounts, loans, deposits, statements, transactions } = await getFinancialData(session.uid);
  
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
      
      <div className="flex items-center gap-4 mb-8">
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
                {accounts.length > 0 ? accounts.map(account => (
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
                )) : <p className="text-muted-foreground col-span-2">No account information available.</p>}
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
                    {transactions.length > 0 ? transactions.map(tx => (
                      <TableRow key={tx.id}>
                        <TableCell>{tx.date}</TableCell>
                        <TableCell className="font-medium">{tx.description}</TableCell>
                        <TableCell className={`text-right font-semibold ${tx.type === 'credit' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type === 'credit' ? '+' : '-'}${Math.abs(tx.amount).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    )) : <TableRow><TableCell colSpan={3} className="text-center">No transactions found.</TableCell></TableRow>}
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
                  {deposits.length > 0 ? deposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.type}</TableCell>
                      <TableCell>${deposit.principal.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                       <TableCell>{deposit.maturityDate}</TableCell>
                      <TableCell>{deposit.interestRate.toFixed(2)}%</TableCell>
                      <TableCell><Badge>{deposit.status}</Badge></TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={5} className="text-center">No deposits found.</TableCell></TableRow>}
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
                  {loans.length > 0 ? loans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.type}</TableCell>
                      <TableCell>${loan.principal.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>${loan.remaining.toLocaleString('en-US', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>{loan.interestRate.toFixed(2)}%</TableCell>
                      <TableCell><Badge>{loan.status}</Badge></TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={5} className="text-center">No loans found.</TableCell></TableRow>}
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
                  {statements.length > 0 ? statements.map(stmt => (
                    <TableRow key={stmt.id}>
                      <TableCell>{stmt.date}</TableCell>
                      <TableCell className="font-medium">{stmt.description}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">Download</Button>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={3} className="text-center">No statements found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
