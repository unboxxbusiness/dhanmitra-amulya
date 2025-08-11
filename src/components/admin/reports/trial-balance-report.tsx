
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getTrialBalance } from '@/actions/accounting';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableFooterComponent } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import Papa from 'papaparse';

type TrialBalanceData = {
    balances: { id: string; name: string; debit: number; credit: number; }[];
    totalDebits: number;
    totalCredits: number;
    isBalanced: boolean;
}

export function TrialBalanceReport() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<TrialBalanceData | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        try {
            const result = await getTrialBalance();
            setData(result);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    const handleExport = () => {
        if (!data) return;
        const csv = Papa.unparse(data.balances);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'trial-balance.csv';
        link.click();
    };

    return (
        <Dialog onOpenChange={(open) => { if (open) handleFetch(); else setData(null); }}>
            <Card>
                <CardHeader>
                    <CardTitle>Trial Balance</CardTitle>
                    <CardDescription>A summary of all ledger accounts to verify debit and credit balances are equal.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Generates a real-time trial balance report from the general ledger.</p>
                </CardContent>
                <CardFooter>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> View & Export
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            <DialogContent className="max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Trial Balance Report</DialogTitle>
                    <DialogDescription>
                        This report is generated in real-time. Export the data as a CSV file.
                    </DialogDescription>
                </DialogHeader>
                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {data && (
                    <>
                        <div className="flex justify-end">
                             <Badge variant={data.isBalanced ? 'default' : 'destructive'}>
                                {data.isBalanced ? 'Balanced' : 'Unbalanced'}
                            </Badge>
                        </div>
                        <div className="max-h-[60vh] overflow-y-auto">
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
                                            {acc.debit > 0 ? `₹${acc.debit.toFixed(2)}` : null}
                                        </TableCell>
                                        <TableCell className="text-right font-mono">
                                            {acc.credit > 0 ? `₹${acc.credit.toFixed(2)}` : null}
                                        </TableCell>
                                    </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooterComponent>
                                    <TableRow className="bg-muted hover:bg-muted">
                                        <TableHead className="text-right">Totals</TableHead>
                                        <TableHead className="text-right font-bold font-mono">₹{data.totalDebits.toFixed(2)}</TableHead>
                                        <TableHead className="text-right font-bold font-mono">₹{data.totalCredits.toFixed(2)}</TableHead>
                                    </TableRow>
                                </TableFooterComponent>
                            </Table>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleExport}>
                                <Download className="mr-2 h-4 w-4" /> Export as CSV
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
