
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KycViewerDialog } from './kyc-viewer-dialog';
import { getPendingApplications, approveApplication, rejectApplication, type Application } from '@/actions/users';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

export function PendingApplicationsTab() {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
        const fetchedApplications = await getPendingApplications();
        setApplications(fetchedApplications);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleViewKyc = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setDialogOpen(true);
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const result = await approveApplication(id);
    if (result.success) {
      toast({ 
        title: 'Application Approved', 
        description: `Member created. Please provide them this temporary password: ${result.tempPassword}`,
        duration: 10000,
      });
      fetchApplications();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setProcessingId(null);
  }

  const handleReject = async (id: string) => {
    setProcessingId(id);
    const result = await rejectApplication(id);
    if (result.success) {
      toast({ title: 'Success', description: 'Application rejected.' });
      fetchApplications();
    } else {
      toast({ variant: 'destructive', title: 'Error', description: result.error });
    }
    setProcessingId(null);
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Pending Applications</CardTitle>
          <CardDescription>Review and process new membership applications.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Application ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Application Date</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[200px] mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-mono text-xs">{app.id}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.applyDate}</TableCell>
                    <TableCell className="text-center space-x-2">
                       {processingId === app.id ? (
                            <Button variant="ghost" size="sm" disabled>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing
                            </Button>
                        ) : (
                          <>
                            <Button variant="outline" size="sm" onClick={() => handleViewKyc(app)}>View KYC</Button>
                            <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700" onClick={() => handleApprove(app.id)}>
                                <CheckCircle className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700" onClick={() => handleReject(app.id)}>
                                <XCircle className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
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
      {selectedApplicant && (
        <KycViewerDialog 
            isOpen={dialogOpen} 
            onOpenChange={setDialogOpen}
            applicant={selectedApplicant}
            kycDocs={selectedApplicant.kycDocs}
        />
      )}
    </>
  );
}
