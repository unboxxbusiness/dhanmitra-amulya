
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getJournalEntries } from '@/actions/accounting';
import type { JournalEntry } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function JournalEntriesTab() {
  const { toast } = useToast();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEntries = async () => {
      setLoading(true);
      try {
        const data = await getJournalEntries();
        setEntries(data);
      } catch (error: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: error.message || 'Could not load journal entries.'
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Entries</CardTitle>
        <CardDescription>A log of all financial transactions recorded in the general ledger.</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
            {loading ? (
                 Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full mb-2" />)
            ) : entries.length > 0 ? (
                entries.map(entry => (
                    <AccordionItem value={entry.id} key={entry.id}>
                        <AccordionTrigger>
                            <div className="flex justify-between items-center w-full pr-4">
                                <div className="text-left">
                                    <p className="font-semibold">{entry.description}</p>
                                    <p className="text-sm text-muted-foreground">{entry.date}</p>
                                </div>
                                <p className="text-sm font-mono text-muted-foreground">ID: {entry.id.substring(0, 8)}...</p>
                            </div>
                        </AccordionTrigger>
                        <AccordionContent>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {entry.entries.map((line, index) => (
                                        <TableRow key={index}>
                                            <TableCell>{line.accountName} ({line.accountId})</TableCell>
                                            <TableCell className="text-right font-mono">
                                                {line.debit > 0 ? `₹${line.debit.toFixed(2)}` : '-'}
                                            </TableCell>
                                            <TableCell className="text-right font-mono">
                                                {line.credit > 0 ? `₹${line.credit.toFixed(2)}` : '-'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </AccordionContent>
                    </AccordionItem>
                ))
            ) : (
                <div className="text-center text-muted-foreground py-8">
                    No journal entries found.
                </div>
            )}
        </Accordion>
      </CardContent>
    </Card>
  );
}
