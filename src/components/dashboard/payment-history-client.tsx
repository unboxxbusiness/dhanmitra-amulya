
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportMemberLoanHistory } from "@/actions/loans";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download } from "lucide-react";
import type { RepaymentWithLoanDetails } from "@/lib/definitions";

interface PaymentHistoryClientProps {
    history: RepaymentWithLoanDetails[];
}

export function PaymentHistoryClient({ history }: PaymentHistoryClientProps) {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const csvString = await exportMemberLoanHistory();
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `loan-payment-history-${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Export Successful', description: 'Your loan history has been downloaded.' });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: 'Could not export your loan history. Please try again.',
            });
        } finally {
            setIsExporting(false);
        }
    };

    const getStatusBadgeVariant = (status: RepaymentWithLoanDetails['status']) => {
        switch (status) {
            case 'paid': return 'default';
            case 'pending': return 'secondary';
            case 'overdue': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>All Repayments</CardTitle>
                <CardDescription>
                    This table shows every EMI for all your active and past loans.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Loan Account</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Date</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length > 0 ? history.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-mono">{item.accountNumber}</TableCell>
                                <TableCell>{item.dueDate}</TableCell>
                                <TableCell>₹{item.emiAmount.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge variant={getStatusBadgeVariant(item.status)} className="capitalize">
                                        {item.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>{item.paymentDate || 'N/A'}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    You have no loan repayment history.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
            <CardFooter>
                <Button onClick={handleExport} disabled={isExporting}>
                    {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export as CSV
                </Button>
            </CardFooter>
        </Card>
    );
}
