
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../../ui/skeleton';
import { getPendingRepayments, recordRepayment } from '@/actions/loans';
import type { RepaymentWithLoanDetails } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function RepaymentsTab() {
  const { toast } = useToast();
  const [repayments, setRepayments] = useState<RepaymentWithLoanDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRepayments = async () => {
    setLoading(true);
    try {
      const data = await getPendingRepayments();
      setRepayments(data);
    } catch(err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRepayments();
  }, []);

  const handleRecordPayment = async (loanId: string, repaymentIndex: number) => {
    const id = `${loanId}_${repaymentIndex}`;
    setProcessingId(id);
    const result = await recordRepayment(loanId, repaymentIndex);
    if (result.success) {
      toast({ title: 'Success', description: 'Repayment recorded successfully.' });
      fetchRepayments(); 
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setProcessingId(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Repayments (EMIs)</CardTitle>
        <CardDescription>A list of all upcoming loan repayments.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Loan Account</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
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
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[120px] mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : repayments.length > 0 ? (
              repayments.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.userName}</TableCell>
                  <TableCell className="font-mono">{r.accountNumber}</TableCell>
                  <TableCell>{r.dueDate}</TableCell>
                  <TableCell>${r.emiAmount.toFixed(2)}</TableCell>
                  <TableCell><Badge variant="secondary">{r.status}</Badge></TableCell>
                  <TableCell className="text-center">
                    {processingId === r.id ? (
                        <Button variant="ghost" size="sm" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                        </Button>
                    ) : (
                        <Button variant="outline" size="sm" onClick={() => handleRecordPayment(r.loanId, r.repaymentIndex)}>
                            <CheckCircle className="mr-2 h-4 w-4" /> Mark as Paid
                        </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">No pending repayments found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
