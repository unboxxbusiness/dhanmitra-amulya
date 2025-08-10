
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { getChartOfAccounts, seedChartOfAccounts } from '@/actions/accounting';
import type { ChartOfAccount, AccountType } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function ChartOfAccountsTab() {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<ChartOfAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  const fetchAccounts = async () => {
    setLoading(true);
    try {
      const fetchedAccounts = await getChartOfAccounts();
      setAccounts(fetchedAccounts);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Could not load chart of accounts.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    try {
        const result = await seedChartOfAccounts();
        if (result.success) {
            toast({ title: 'Success', description: result.message });
            fetchAccounts();
        } else {
            toast({ variant: 'destructive', title: 'Info', description: result.message });
        }
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    }
    setSeeding(false);
  }

  const getTypeBadgeVariant = (type: AccountType) => {
    switch (type) {
      case 'Asset': return 'default';
      case 'Liability': return 'destructive';
      case 'Equity': return 'secondary';
      case 'Revenue': return 'default';
      case 'Expense': return 'destructive';
      default: return 'outline';
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Chart of Accounts</CardTitle>
        <CardDescription>The general ledger accounts for the cooperative.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Code</TableHead>
              <TableHead>Account Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Balance</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-32 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : accounts.length > 0 ? (
              accounts.map((acc) => (
                <TableRow key={acc.id}>
                  <TableCell className="font-mono">{acc.id}</TableCell>
                  <TableCell className="font-medium">{acc.name}</TableCell>
                  <TableCell>
                    <Badge variant={getTypeBadgeVariant(acc.type)}>{acc.type}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">₹{acc.balance.toFixed(2)}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                    <p className="mb-2">Your Chart of Accounts is empty.</p>
                    <Button onClick={handleSeed} disabled={seeding}>
                        {seeding && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                        Seed Initial Accounts
                    </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <p className="text-xs text-muted-foreground">This is a real-time view of all account balances in the general ledger.</p>
      </CardFooter>
    </Card>
  );
}
