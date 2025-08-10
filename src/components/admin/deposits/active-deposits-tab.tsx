
'use client';

import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveDeposits } from '@/actions/deposits';
import type { ActiveDeposit } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

export function ActiveDepositsTab() {
  const { toast } = useToast();
  const [deposits, setDeposits] = useState<ActiveDeposit[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const fetchedDeposits = await getActiveDeposits();
      setDeposits(fetchedDeposits);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching deposits',
        description: error.message || 'Could not load active deposit data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Deposits</CardTitle>
        <CardDescription>A list of all ongoing FD and RD accounts.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account Number</TableHead>
              <TableHead>Member Name</TableHead>
              <TableHead>Principal Amount</TableHead>
              <TableHead>Maturity Amount</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Maturity Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px]" /></TableCell>
                </TableRow>
              ))
            ) : deposits.length > 0 ? (
              deposits.map((deposit) => (
                <TableRow key={deposit.id}>
                  <TableCell className="font-mono">{deposit.accountNumber}</TableCell>
                  <TableCell className="font-medium">{deposit.userName}</TableCell>
                  <TableCell>₹{deposit.principalAmount.toFixed(2)}</TableCell>
                  <TableCell>₹{deposit.maturityAmount.toFixed(2)}</TableCell>
                  <TableCell>{deposit.startDate}</TableCell>
                  <TableCell>{deposit.maturityDate}</TableCell>
                  <TableCell>
                    <Badge>{deposit.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">No active deposits found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
