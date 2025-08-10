
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Scale } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getBalanceSheetReport, type BalanceSheetReport as BalanceSheetReportData } from '@/actions/reports';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableFooterComponent } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

export function BalanceSheetReport() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<BalanceSheetReportData | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        setData(null);
        try {
            const result = await getBalanceSheetReport();
            setData(result);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog onOpenChange={(open) => { if (open) handleFetch(); }}>
            <Card>
                <CardHeader>
                    <CardTitle>Balance Sheet</CardTitle>
                    <CardDescription>A snapshot of the company's financial health (Assets = Liabilities + Equity).</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Generates a real-time balance sheet from the general ledger.</p>
                </CardContent>
                <CardFooter>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> View Report
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Scale /> Balance Sheet Report
                    </DialogTitle>
                    <DialogDescription>
                        This report is generated in real-time as of today.
                    </DialogDescription>
                </DialogHeader>
                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {data && (
                    <div className="max-h-[70vh] overflow-y-auto pr-4">
                        <div className="flex justify-end mb-4">
                            <Badge variant={data.isBalanced ? 'default' : 'destructive'}>
                                {data.isBalanced ? 'Balanced' : 'Unbalanced'}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            {/* Assets Side */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Assets</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.assets.map(item => (
                                            <TableRow key={item.name}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="text-right font-mono">₹{item.balance.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooterComponent>
                                        <TableRow>
                                            <TableHead>Total Assets</TableHead>
                                            <TableHead className="text-right font-bold font-mono">₹{data.totalAssets.toFixed(2)}</TableHead>
                                        </TableRow>
                                    </TableFooterComponent>
                                </Table>
                            </div>

                            {/* Liabilities & Equity Side */}
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Liabilities</h3>
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Account</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.liabilities.map(item => (
                                            <TableRow key={item.name}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="text-right font-mono">₹{item.balance.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                                
                                <Separator className="my-4" />

                                <h3 className="text-lg font-semibold mb-2">Equity</h3>
                                <Table>
                                     <TableHeader>
                                        <TableRow>
                                            <TableHead>Account</TableHead>
                                            <TableHead className="text-right">Balance</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {data.equity.map(item => (
                                            <TableRow key={item.name}>
                                                <TableCell>{item.name}</TableCell>
                                                <TableCell className="text-right font-mono">₹{item.balance.toFixed(2)}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableFooterComponent>
                                         <TableRow>
                                            <TableHead>Total Liabilities & Equity</TableHead>
                                            <TableHead className="text-right font-bold font-mono">₹{data.totalLiabilitiesAndEquity.toFixed(2)}</TableHead>
                                        </TableRow>
                                    </TableFooterComponent>
                                </Table>
                            </div>
                        </div>
                    </div>
                )}
                 {!loading && data && data.assets.length === 0 && (
                     <div className="text-center text-muted-foreground py-16">
                        No ledger data found to generate a report.
                    </div>
                 )}
            </DialogContent>
        </Dialog>
    )
}
