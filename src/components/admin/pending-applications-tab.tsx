
'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KycViewerDialog } from './kyc-viewer-dialog';
import { getPendingApplications, type Application } from '@/actions/users';
import { Skeleton } from '../ui/skeleton';

export function PendingApplicationsTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const fetchedApplications = await getPendingApplications();
      setApplications(fetchedApplications);
      setLoading(false);
    };
    fetchApplications();
  }, []);

  const handleViewKyc = (applicant: Application) => {
    setSelectedApplicant(applicant);
    setDialogOpen(true);
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
              ) : (
                applications.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium">{app.id}</TableCell>
                    <TableCell>{app.name}</TableCell>
                    <TableCell>{app.email}</TableCell>
                    <TableCell>{app.applyDate}</TableCell>
                    <TableCell className="text-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleViewKyc(app)}>View KYC</Button>
                      <Button variant="ghost" size="icon" className="text-green-600 hover:text-green-700">
                          <CheckCircle className="h-4 w-4" />
                          <span className="sr-only">Approve</span>
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600 hover:text-red-700">
                          <XCircle className="h-4 w-4" />
                          <span className="sr-only">Reject</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
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
