
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveLoans } from '@/actions/loans';
import type { ActiveLoan } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';

export function ActiveLoansTab() {
  const { toast } = useToast();
  const [loans, setLoans] = useState<ActiveLoan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const fetchedLoans = await getActiveLoans();
      setLoans(fetchedLoans);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching loans',
        description: error.message || 'Could not load active loan data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const calculateRepaymentProgress = (loan: ActiveLoan) => {
    const paidCount = loan.repaymentSchedule.filter(r => r.status === 'paid').length;
    return (paidCount / loan.termMonths) * 100;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Loans</CardTitle>
        <CardDescription>A list of all disbursed and ongoing loans.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Member Name</TableHead>
              <TableHead>Principal</TableHead>
              <TableHead>EMI</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Disbursal Date</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                </TableRow>
              ))
            ) : loans.length > 0 ? (
              loans.map((loan) => (
                <TableRow key={loan.id}>
                  <TableCell className="font-mono">{loan.accountNumber}</TableCell>
                  <TableCell className="font-medium">{loan.userName}</TableCell>
                  <TableCell>${loan.principal.toFixed(2)}</TableCell>
                  <TableCell>${loan.emiAmount.toFixed(2)}</TableCell>
                  <TableCell>${loan.outstandingBalance.toFixed(2)}</TableCell>
                  <TableCell>{loan.disbursalDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={calculateRepaymentProgress(loan)} className="w-[100px]" />
                      <span className="text-xs text-muted-foreground">{calculateRepaymentProgress(loan).toFixed(0)}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No active loans found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
