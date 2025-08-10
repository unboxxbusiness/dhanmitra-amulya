
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, BookOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getProfitAndLossReport, type PandLReport } from '@/actions/reports';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter as TableFooterComponent } from "@/components/ui/table";
import { Separator } from '@/components/ui/separator';

export function ProfitLossReport() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<PandLReport | null>(null);

    const handleFetch = async () => {
        setLoading(true);
        setData(null);
        try {
            const result = await getProfitAndLossReport();
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
                    <CardTitle>Profit & Loss Statement</CardTitle>
                    <CardDescription>A summary of revenues, costs, and expenses during a specific period.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">Generates a real-time P&L statement from the general ledger.</p>
                </CardContent>
                <CardFooter>
                    <DialogTrigger asChild>
                        <Button className="w-full">
                            <Eye className="mr-2 h-4 w-4" /> View Report
                        </Button>
                    </DialogTrigger>
                </CardFooter>
            </Card>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2"><BookOpen /> Profit & Loss Statement</DialogTitle>
                    <DialogDescription>
                        This report is generated in real-time from your general ledger accounts.
                    </DialogDescription>
                </DialogHeader>
                {loading && <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /></div>}
                {data && (
                    <div className="max-h-[60vh] overflow-y-auto pr-4">
                        {/* Revenue Section */}
                        <h3 className="text-lg font-semibold mb-2">Revenue</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.revenue.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right font-mono">₹{item.balance.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                            <TableFooterComponent>
                                <TableRow>
                                    <TableHead>Total Revenue</TableHead>
                                    <TableHead className="text-right font-bold font-mono">₹{data.totalRevenue.toFixed(2)}</TableHead>
                                </TableRow>
                            </TableFooterComponent>
                        </Table>

                        <Separator className="my-6" />

                        {/* Expenses Section */}
                        <h3 className="text-lg font-semibold mb-2">Expenses</h3>
                        <Table>
                             <TableHeader>
                                <TableRow>
                                    <TableHead>Account</TableHead>
                                    <TableHead className="text-right">Balance</TableHead>
                                </TableRow>
                            </TableHeader>
                             <TableBody>
                                {data.expenses.map(item => (
                                    <TableRow key={item.name}>
                                        <TableCell>{item.name}</TableCell>
                                        <TableCell className="text-right font-mono">₹{item.balance.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                             <TableFooterComponent>
                                <TableRow>
                                    <TableHead>Total Expenses</TableHead>
                                    <TableHead className="text-right font-bold font-mono">₹{data.totalExpenses.toFixed(2)}</TableHead>
                                </TableRow>
                            </TableFooterComponent>
                        </Table>

                        <Separator className="my-6" />

                        {/* Net Profit Section */}
                        <div className={`flex justify-between items-center p-4 rounded-md ${data.netProfit >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            <h3 className="text-lg font-bold">Net Profit / (Loss)</h3>
                            <p className="text-xl font-bold font-mono">
                                {data.netProfit < 0 && '-'}₹{Math.abs(data.netProfit).toFixed(2)}
                            </p>
                        </div>
                    </div>
                )}
                 {!loading && data && data.revenue.length === 0 && data.expenses.length === 0 && (
                     <div className="text-center text-muted-foreground py-16">
                        No revenue or expense data found to generate a report.
                    </div>
                 )}
            </DialogContent>
        </Dialog>
    )
}
