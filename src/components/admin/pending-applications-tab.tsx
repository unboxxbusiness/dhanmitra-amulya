
'use client';

import { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, Loader2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KycViewerDialog } from './kyc-viewer-dialog';
import { getPendingApplications, approveApplication, rejectApplication, type Application } from '@/actions/users';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PendingApplicationsTab() {
  const { toast } = useToast();
  const [kycDialogOpen, setKycDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
        const fetchedApplications = await getPendingApplications();
        setApplications(fetchedApplications);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleViewKyc = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setKycDialogOpen(true);
  }

  const handleApprove = async (id: string) => {
    setProcessingId(id);
    const result = await approveApplication(id);
    if (result.success && result.tempPassword) {
      setTempPassword(result.tempPassword);
      setPasswordDialogOpen(true);
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

  const copyToClipboard = () => {
    if (tempPassword) {
        navigator.clipboard.writeText(tempPassword);
        toast({ title: 'Copied!', description: 'Password copied to clipboard.' });
    }
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
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
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-8 w-[200px] mx-auto" /></TableCell>
                  </TableRow>
                ))
              ) : applications.length > 0 ? (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.phone}</TableCell>
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
            isOpen={kycDialogOpen} 
            onOpenChange={setKycDialogOpen}
            applicant={selectedApplicant}
            kycDocs={selectedApplicant.kycDocs}
        />
      )}

      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
          <DialogContent>
              <DialogHeader>
                  <DialogTitle>Application Approved!</DialogTitle>
                  <DialogDescription>
                      A new member account has been created. Please securely provide the temporary password to the member.
                  </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="temp-password">Temporary Password</Label>
                <div className="flex items-center space-x-2">
                    <Input id="temp-password" value={tempPassword || ''} readOnly />
                    <Button size="icon" onClick={copyToClipboard}>
                        <Copy className="h-4 w-4" />
                    </Button>
                </div>
              </div>
              <DialogFooter>
                  <Button onClick={() => setPasswordDialogOpen(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
      </Dialog>
    </>
  );
}
