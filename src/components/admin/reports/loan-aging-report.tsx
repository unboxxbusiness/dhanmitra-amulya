
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getLoanAgingReport, exportLoanAgingReport, type LoanAgingReportData } from '@/actions/reports';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';

export function LoanAgingReport() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<LoanAgingReportData[] | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        try {
            const result = await getLoanAgingReport();
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
            const csvString = await exportLoanAgingReport();
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'loan-aging-report.csv';
            link.click();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const getStatusVariant = (status: LoanAgingReportData['status']): "default" | "secondary" | "destructive" => {
        if (status === 'Performing') return 'default';
        if (status.startsWith('SMA')) return 'secondary';
        return 'destructive';
    }


    return (
        <Dialog onOpenChange={(open) => { if (open) handleFetch(); else setData(null); }}>
            <Card>
                <CardHeader>
                    <CardTitle>Loan Aging & NPA</CardTitle>
                    <CardDescription>Analyzes overdue loans to identify Non-Performing Assets (NPAs).</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Classifies loans based on the number of days payments are overdue.</p>
                </CardContent>
                <CardFooter>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> View & Export
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            <DialogContent className="max-w-5xl">
                <DialogHeader>
                    <DialogTitle>Loan Aging / NPA Report</DialogTitle>
                    <DialogDescription>
                       Loans are categorized based on overdue status. NPA includes Sub-Standard and below.
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
                                        <TableHead>Status</TableHead>
                                        <TableHead>Days Overdue</TableHead>
                                        <TableHead className="text-right">Principal</TableHead>
                                        <TableHead className="text-right">Outstanding</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {data.map((loan) => (
                                        <TableRow key={loan.accountNumber}>
                                            <TableCell className="font-mono">{loan.accountNumber}</TableCell>
                                            <TableCell className="font-medium">{loan.userName}</TableCell>
                                            <TableCell>
                                                <Badge variant={getStatusVariant(loan.status)}>{loan.status}</Badge>
                                            </TableCell>
                                            <TableCell>{loan.daysOverdue}</TableCell>
                                            <TableCell className="text-right font-mono">₹{loan.principal.toFixed(2)}</TableCell>
                                            <TableCell className="text-right font-mono">₹{loan.outstandingBalance.toFixed(2)}</TableCell>
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
                 {!loading && data?.length === 0 && (
                     <div className="text-center text-muted-foreground py-16">
                        No active loans found to generate a report.
                    </div>
                 )}
            </DialogContent>
        </Dialog>
    )
}
