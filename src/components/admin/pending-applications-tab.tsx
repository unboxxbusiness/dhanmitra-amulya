
'use client';

import { useState } from 'react';
import { MoreHorizontal, CheckCircle, XCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KycViewerDialog } from './kyc-viewer-dialog';

// Mock Data
const applications = [
  { id: "APP-001", name: "Alice Johnson", email: "alice.j@example.com", applyDate: "2024-07-20" },
  { id: "APP-002", name: "Bob Williams", email: "bob.w@example.com", applyDate: "2024-07-19" },
  { id: "APP-003", name: "Charlie Brown", email: "charlie.b@example.com", applyDate: "2024-07-18" },
];

const kycDocs = {
    id: 'https://placehold.co/800x500.png',
    photo: 'https://placehold.co/400x400.png',
    addressProof: 'https://placehold.co/800x1100.png'
}

export function PendingApplicationsTab() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  const handleViewKyc = (applicant: any) => {
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
              {applications.map((app) => (
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
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedApplicant && (
        <KycViewerDialog 
            isOpen={dialogOpen} 
            onOpenChange={setDialogOpen}
            applicant={selectedApplicant}
            kycDocs={kycDocs}
        />
      )}
    </>
  );
}
