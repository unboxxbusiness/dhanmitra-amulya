
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getSavingsAccountReport, exportSavingsAccountReport, type SavingsAccountReportData } from '@/actions/reports';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export function SavingsAccountReport() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<SavingsAccountReportData[] | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        try {
            const result = await getSavingsAccountReport();
            setData(result);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    const handleExport = async () => {
        setLoading(true);
        try {
            const csvString = await exportSavingsAccountReport();
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'savings-accounts-report.csv';
            link.click();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog onOpenChange={(open) => { if (open) handleFetch(); else setData(null); }}>
            <Card>
                <CardHeader>
                    <CardTitle>Savings Account Balances</CardTitle>
                    <CardDescription>View and export a detailed list of all member savings accounts and their balances.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Generates a real-time list of all savings accounts.</p>
                </CardContent>
                <CardFooter>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> View & Export
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>Savings Account Report</DialogTitle>
                    <DialogDescription>
                        This report is generated in real-time. Export the data as a CSV file.
                    </DialogDescription>
                </DialogHeader>
                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {data && (
                    <>
                        <div className="max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Account Number</TableHead>
                                        <TableHead>Member Name</TableHead>
                                        <TableHead>Scheme</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Balance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((acc) => (
                                        <TableRow key={acc.accountNumber}>
                                            <TableCell className="font-mono">{acc.accountNumber}</TableCell>
                                            <TableCell className="font-medium">{acc.userName}</TableCell>
                                            <TableCell>{acc.schemeName}</TableCell>
                                            <TableCell><Badge>{acc.status}</Badge></TableCell>
                                            <TableCell className="text-right font-mono">${acc.balance.toFixed(2)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <DialogFooter>
                            <Button onClick={handleExport} disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Download className="mr-2 h-4 w-4" /> Export as CSV
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
