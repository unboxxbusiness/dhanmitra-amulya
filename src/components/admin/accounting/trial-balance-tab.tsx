
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableFooterComponent } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getTrialBalance } from '@/actions/accounting';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

type TrialBalanceData = {
    balances: { id: string; name: string; debit: number; credit: number; }[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
}

export function TrialBalanceTab() {
  const { toast } = useToast();
  const [data, setData] = useState<TrialBalanceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getTrialBalance();
        setData(result);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not generate trial balance.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Trial Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Could not load data.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Trial Balance</CardTitle>
                <CardDescription>A summary of all ledger accounts to verify debit and credit balances.</CardDescription>
            </div>
            <Badge variant={data.isBalanced ? 'default' : 'destructive'}>
                {data.isBalanced ? 'Balanced' : 'Unbalanced'}
            </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.balances.map((acc) => (
              <TableRow key={acc.id}>
                <TableCell className="font-medium">{acc.name} ({acc.id})</TableCell>
                <TableCell className="text-right font-mono">
                    {acc.debit > 0 ? `$${acc.debit.toFixed(2)}` : null}
                </TableCell>
                <TableCell className="text-right font-mono">
                    {acc.credit > 0 ? `$${acc.credit.toFixed(2)}` : null}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooterComponent>
            <TableRow className="bg-muted hover:bg-muted">
                <TableHead className="text-right">Totals</TableHead>
                <TableHead className="text-right font-bold font-mono">${data.totalDebits.toFixed(2)}</TableHead>
                <TableHead className="text-right font-bold font-mono">${data.totalCredits.toFixed(2)}</TableHead>
            </TableRow>
          </TableFooterComponent>
        </Table>
      </CardContent>
    </Card>
  );
}
