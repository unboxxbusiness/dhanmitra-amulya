
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getSavingsAccounts, type SavingsAccount } from '@/actions/savings';
import { useToast } from '@/hooks/use-toast';
import { CreateAccountDialog } from './create-account-dialog';

export function SavingsAccountsTab() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const fetchedAccounts = await getSavingsAccounts();
      setAccounts(fetchedAccounts);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching accounts',
        description: 'Could not load savings account data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);
  
  const handleDialogClose = (refresh?: boolean) => {
    setCreateDialogOpen(false);
    if (refresh) {
        fetchAccounts();
    }
  }

  const getStatusBadgeVariant = (status: SavingsAccount['status']) => {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Dormant':
        return 'secondary';
      case 'Closed':
        return 'destructive';
      default:
        return 'outline';
    }
  }


  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Member Savings Accounts</CardTitle>
          <CardDescription>A list of all savings accounts.</CardDescription>
           <div className="flex items-center gap-4 pt-4">
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Account
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account Number</TableHead>
                <TableHead>Member Name</TableHead>
                <TableHead>Scheme</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px] ml-auto" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : (
                accounts.map((account) => (
                  <TableRow key={account.id}>
                    <TableCell className="font-mono">{account.accountNumber}</TableCell>
                    <TableCell className="font-medium">{account.userName}</TableCell>
                    <TableCell>{account.schemeName}</TableCell>
                    <TableCell className="text-right font-medium">₹{account.balance.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={getStatusBadgeVariant(account.status)}>
                        {account.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{account.createdAt}</TableCell>
                  </TableRow>
                ))
              )}
               {!loading && accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    No savings accounts found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <CreateAccountDialog 
        isOpen={isCreateDialogOpen}
        onClose={handleDialogClose}
      />
    </>
  );
}
