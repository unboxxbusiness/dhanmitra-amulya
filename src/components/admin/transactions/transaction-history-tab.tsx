

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { getTransactionHistory } from '@/actions/transactions';
import type { Transaction } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { DataTablePagination } from '@/components/data-table-pagination';

export function TransactionHistoryTab() {
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
        const result = await getTransactionHistory({ page, pageSize });
        setTransactions(result.transactions);
        setTotalCount(result.totalCount);
        setHasMore(result.hasMore);
    } catch (error: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: error.message || 'Could not load transaction history.',
        });
    } finally {
        setLoading(false);
    }
  }, [toast, page, pageSize]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>A log of the most recent transactions.</CardDescription>
        {/* TODO: Add filtering options */}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Member</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Teller</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: pageSize }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                </TableRow>
              ))
            ) : transactions.length > 0 ? (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="text-xs">{tx.date}</TableCell>
                  <TableCell className="font-medium">{tx.userName}</TableCell>
                   <TableCell>
                      <Badge variant={tx.type === 'credit' ? 'default' : 'secondary'} className={tx.type === 'credit' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}>
                        {tx.type}
                      </Badge>
                   </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell>{tx.tellerName}</TableCell>
                  <TableCell className={`text-right font-mono ${tx.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center">No transactions found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <DataTablePagination 
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalCount={totalCount}
            hasMore={hasMore}
        />
      </CardFooter>
    </Card>
  );
}
