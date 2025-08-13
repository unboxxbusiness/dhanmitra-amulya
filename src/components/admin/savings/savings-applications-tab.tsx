
'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '../../ui/skeleton';
import { getSavingsApplications, approveSavingsApplication, rejectSavingsApplication } from '@/actions/savings';
import type { SavingsApplication } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';

export function SavingsApplicationsTab() {
  const { toast } = useToast();
  const [applications, setApplications] = useState<SavingsApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSavingsApplications();
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

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const result = await approveSavingsApplication(id);
    if (result.success) {
      toast({ title: 'Success', description: 'Application approved and account is now active.' });
      fetchApplications(); // Refresh list
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setProcessingId(null);
  }

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const result = await rejectSavingsApplication(id);
     if (result.success) {
      toast({ title: 'Success', description: 'Application has been rejected.' });
      fetchApplications(); // Refresh list
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setProcessingId(null);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Savings Account Applications</CardTitle>
        <CardDescription>Review and process new savings account applications.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Member</TableHead>
              <TableHead>Scheme</TableHead>
              <TableHead>Initial Deposit</TableHead>
              <TableHead>Application Date</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-8 w-[120px] mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : applications.length > 0 ? (
              applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.userName}</TableCell>
                  <TableCell>{app.schemeName}</TableCell>
                  <TableCell>₹{app.initialDeposit.toFixed(2)}</TableCell>
                  <TableCell>{app.applicationDate}</TableCell>
                  <TableCell className="text-center space-x-2">
                    {processingId === app.id ? (
                        <Button variant="ghost" size="sm" disabled>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(app.id)}>
                                <CheckCircle className="mr-1 h-4 w-4" /> Approve
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={() => handleReject(app.id)}>
                                <XCircle className="mr-1 h-4 w-4" /> Reject
                            </Button>
                        </>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
                <TableRow>
                    <TableCell colSpan={5} className="text-center">No pending applications found.</TableCell>
                </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
