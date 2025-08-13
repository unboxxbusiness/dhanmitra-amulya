
"use client";

import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { IndianRupee } from 'lucide-react';
import { getMemberFinancials, type MemberFinancials } from '@/actions/users';
import { getSocietyConfig, type SocietyConfig } from '@/actions/settings';
import type { UserSession } from '@/lib/definitions';
import { DashboardLoadingSkeleton } from '@/components/dashboard/dashboard-loading-skeleton';
import { UpiQrCodeDialog } from '@/components/dashboard/upi-qr-code-dialog';

type UpiPaymentDetails = {
  amount: number;
  notes: string;
}

export default function AccountsPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [financialData, setFinancialData] = useState<MemberFinancials | null>(null);
  const [societyConfig, setSocietyConfig] = useState<SocietyConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [upiDetails, setUpiDetails] = useState<UpiPaymentDetails | null>(null);
  const [isQrDialogOpen, setQrDialogOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSession = await getSession();
        if (!userSession) {
          router.push('/login');
          return;
        }
        setSession(userSession);

        const [finData, configData] = await Promise.all([
          getMemberFinancials(),
          getSocietyConfig(),
        ]);
        setFinancialData(finData);
        setSocietyConfig(configData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);
  
  const handlePaymentClick = (amount: number, notes: string) => {
    setUpiDetails({ amount, notes });
    setQrDialogOpen(true);
  }

  if (loading || !session || !financialData || !societyConfig) {
    return <DashboardLoadingSkeleton />;
  }

  const { savingsAccounts, activeLoans, activeDeposits } = financialData;

  return (
    <>
      <div className="space-y-8">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">My Accounts</h1>
            <p className="text-muted-foreground">Your Member ID: <span className="font-mono">{session.memberId || 'N/A'}</span></p>
        </header>
        
        <section id="savings-accounts">
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
                      </div>
                      <Badge variant="outline">{account.status}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Current Balance</p>
                      <p className="text-3xl font-bold">₹{account.balance.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</p>
                    </CardContent>
                    <CardFooter className="flex-col items-start gap-2">
                       <Button 
                          size="sm" 
                          onClick={() => handlePaymentClick(0, `SAVINGS-DEPOSIT-${session.memberId}`)} 
                          disabled={!societyConfig.upiId} 
                          title={!societyConfig.upiId ? "UPI payment is not configured by the admin" : "Deposit via UPI"}
                        >
                          <IndianRupee className="mr-2 h-4 w-4" />
                          Deposit via UPI
                      </Button>
                      <p className="text-xs text-muted-foreground">Note: After paying via UPI, please contact support with the transaction reference to have the amount credited to your account.</p>
                    </CardFooter>
                  </Card>
                )) : <p className="text-muted-foreground p-4 text-center">No savings accounts found.</p>}
            </CardContent>
          </Card>
        </section>

        <section id="loan-accounts">
          <Card>
            <CardHeader>
              <CardTitle>Loan Accounts</CardTitle>
              <CardDescription>Manage your loan accounts and repayments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Outstanding</TableHead>
                    <TableHead>Next EMI</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeLoans.length > 0 ? activeLoans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-medium">{loan.productName}</TableCell>
                      <TableCell>₹{loan.outstandingBalance.toLocaleString('en-IN', {minimumFractionDigits: 2})}</TableCell>
                      <TableCell>₹{loan.emiAmount.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          size="sm" 
                          onClick={() => handlePaymentClick(loan.emiAmount, `LOAN-REPAY-${session.memberId}-${loan.id.slice(0,4)}`)}
                          disabled={!societyConfig.upiId} 
                          title={!societyConfig.upiId ? "UPI payment is not configured by the admin" : "Pay via UPI"}
                        >
                          <IndianRupee className="mr-2 h-4 w-4" />
                          Repay EMI
                        </Button>
                      </TableCell>
                    </TableRow>
                  )) : <TableRow><TableCell colSpan={4} className="text-center h-24">No active loans found.</TableCell></TableRow>}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

         <section id="deposit-accounts">
           <Card>
            <CardHeader>
              <CardTitle>Deposit Accounts</CardTitle>
              <CardDescription>Your term deposit (FD/RD) investments.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Maturity Date</TableHead>
                    <TableHead>Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDeposits.length > 0 ? activeDeposits.map(deposit => (
                    <TableRow key={deposit.id}>
                      <TableCell className="font-medium">{deposit.productName}</TableCell>
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
      {upiDetails && societyConfig.upiId && (
        <UpiQrCodeDialog
          isOpen={isQrDialogOpen}
          onClose={() => setQrDialogOpen(false)}
          upiId={societyConfig.upiId}
          name={societyConfig.name}
          amount={upiDetails.amount}
          notes={upiDetails.notes}
        />
      )}
    </>
  );
}
