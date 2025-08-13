
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../../ui/skeleton';
import { getLoanApplications, verifyLoanApplication, approveLoanApplication, rejectLoanApplication, disburseLoan } from '@/actions/loans';
import type { LoanApplicationDetails } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, XCircle, ShieldCheck, ThumbsUp, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function LoanApplicationsTab() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<LoanApplicationDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLoanApplications();
      setApplications(data);
    } catch(err: any) {
      toast({ variant: 'destructive', title: 'Error', description: err.message });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleAction = async (id: string, action: 'verify' | 'approve' | 'reject' | 'disburse') => {
    setProcessingId(id);
    let result;
    const actionMap = {
        verify: verifyLoanApplication,
        approve: approveLoanApplication,
        reject: rejectLoanApplication,
        disburse: disburseLoan,
    };
    
    result = await actionMap[action](id);

    if (result.success) {
      toast({ title: 'Success', description: `Application has been ${action}ed.` });
      fetchApplications();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setProcessingId(null);
  }

  const getStatusBadge = (status: LoanApplicationDetails['status']) => {
    const variants: Record<LoanApplicationDetails['status'], 'default' | 'secondary' | 'destructive'> = {
        pending: 'secondary',
        verified: 'default',
        approved: 'default',
        rejected: 'destructive',
        disbursed: 'default',
    };
    const bgColors: Record<LoanApplicationDetails['status'], string> = {
        pending: 'bg-yellow-500',
        verified: 'bg-blue-500',
        approved: 'bg-green-500',
        rejected: 'bg-red-500',
        disbursed: 'bg-purple-500',
    }
    return <Badge variant={variants[status]} className={`${bgColors[status]} hover:${bgColors[status]} text-white`}>{status}</Badge>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Loan Applications</CardTitle>
        <CardDescription>Review and process new loan applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[200px] mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.userName}</TableCell>
                  <TableCell>{app.productName}</TableCell>
                  <TableCell>₹{app.amountRequested.toFixed(2)}</TableCell>
                  <TableCell>{app.termMonths} months</TableCell>
                  <TableCell>{getStatusBadge(app.status)}</TableCell>
                  <TableCell className="text-center space-x-1">
                    {processingId === app.id ? (
                        <Button variant="ghost" size="sm" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                        </Button>
                    ) : (
                        <>
                            {app.status === 'pending' && <Button variant="ghost" size="sm" onClick={() => handleAction(app.id, 'verify')}><ShieldCheck className="mr-1 h-4 w-4"/>Verify</Button>}
                            {app.status === 'verified' && (
                                <>
                                    <Button variant="ghost" size="sm" className="text-green-600" onClick={() => handleAction(app.id, 'approve')}><ThumbsUp className="mr-1 h-4 w-4"/>Approve</Button>
                                    <Button variant="ghost" size="sm" className="text-red-600" onClick={() => handleAction(app.id, 'reject')}><XCircle className="mr-1 h-4 w-4"/>Reject</Button>
                                </>
                            )}
                            {app.status === 'approved' && <Button variant="ghost" size="sm" onClick={() => handleAction(app.id, 'disburse')}><Wallet className="mr-1 h-4 w-4"/>Disburse</Button>}
                        </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={6} className="text-center">No pending applications found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
