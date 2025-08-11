
"use client";

import { useState, useEffect } from 'react';
import { getSession } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Landmark, DollarSign, CreditCard, Receipt, PlusCircle, Link as LinkIcon, Wallet, PiggyBank, History, FileText, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getMemberFinancials, type MemberFinancials } from '@/actions/users';
import { getSocietyConfig, type SocietyConfig } from '@/actions/settings';
import { Separator } from '@/components/ui/separator';
import React from 'react';
import type { UserSession, UserProfile } from '@/lib/definitions';
import { DashboardLoadingSkeleton } from '@/components/dashboard/dashboard-loading-skeleton';
import { getMemberProfile } from '@/actions/users';

const QuickLink = ({ href, icon, title, description }: { href: string; icon: React.ElementType; title: string; description: string; }) => {
    const Icon = icon;
    return (
        <Link href={href} className="block p-4 rounded-lg hover:bg-muted transition-colors group">
            <div className="flex items-center gap-4">
                <div className="bg-primary/10 text-primary p-3 rounded-lg">
                    <Icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                    <p className="font-semibold">{title}</p>
                    <p className="text-sm text-muted-foreground">{description}</p>
                </div>
                 <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    )
}


export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<UserSession | null>(null);
  const [financialData, setFinancialData] = useState<MemberFinancials | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userSession = await getSession();
        if (!userSession) {
          router.push('/login');
          return;
        }
        setSession(userSession);

        const [finData, profileData] = await Promise.all([
          getMemberFinancials(),
          getMemberProfile()
        ]);
        setFinancialData(finData);
        setProfile(profileData);
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  if (loading || !session || !financialData || !profile) {
    return <DashboardLoadingSkeleton />;
  }

  const { savingsAccounts, activeLoans, activeDeposits, recentTransactions } = financialData;

  const totalSavings = savingsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalOutstandingLoan = activeLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
  const totalDeposits = activeDeposits.reduce((sum, deposit) => sum + deposit.principalAmount, 0);
  
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Welcome back, {session.name || 'member'}!</h1>
        <p className="text-muted-foreground">Your Member ID: <span className="font-mono">{profile.memberId}</span></p>
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

       {/* Quick Links */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <QuickLink href="/dashboard/apply-loan" icon={PlusCircle} title="Apply for a Loan" description="Get quick access to funds." />
            <QuickLink href="/dashboard/apply-deposit" icon={PiggyBank} title="Open a Deposit" description="Grow your savings with fixed returns." />
            <QuickLink href="/dashboard/savings-history" icon={History} title="View History" description="Check your transaction records." />
        </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                    <CardDescription>Your last 10 transactions across all savings accounts.</CardDescription>
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
                        <Link href="/dashboard/savings-history">View All Savings History</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle>Your Accounts</CardTitle>
                     <CardDescription>A summary of your active accounts.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                       {savingsAccounts.length > 0 && (
                           <div>
                                <h4 className="font-medium mb-2">Savings</h4>
                                {savingsAccounts.map(acc => (
                                    <p key={acc.id} className="text-sm text-muted-foreground">{acc.schemeName}: ₹{acc.balance.toLocaleString('en-IN')}</p>
                                ))}
                           </div>
                       )}
                       {activeLoans.length > 0 && (
                           <div>
                                <h4 className="font-medium mb-2 mt-4">Loans</h4>
                                {activeLoans.map(loan => (
                                    <p key={loan.id} className="text-sm text-muted-foreground">{loan.productName}: ₹{loan.outstandingBalance.toLocaleString('en-IN')}</p>
                                ))}
                           </div>
                       )}
                        {activeDeposits.length > 0 && (
                           <div>
                                <h4 className="font-medium mb-2 mt-4">Deposits</h4>
                                {activeDeposits.map(dep => (
                                    <p key={dep.id} className="text-sm text-muted-foreground">{dep.productName}: ₹{dep.principalAmount.toLocaleString('en-IN')}</p>
                                ))}
                           </div>
                       )}
                       {savingsAccounts.length === 0 && activeLoans.length === 0 && activeDeposits.length === 0 && (
                           <p className="text-sm text-muted-foreground text-center py-4">You have no active accounts.</p>
                       )}
                    </div>
                </CardContent>
                <CardFooter>
                     <Button asChild variant="secondary" className="w-full">
                        <Link href="/dashboard/accounts">Manage All Accounts</Link>
                    </Button>
                </CardFooter>
            </Card>
        </div>
      </div>
    </div>
  );
}
