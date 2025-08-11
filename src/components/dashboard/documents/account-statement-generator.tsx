
'use client';

import { useState, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2, Download, Search } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { addDays, format, subDays } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useToast } from '@/hooks/use-toast';
import { getTransactionHistory, exportTransactionsToCsv, type Transaction } from '@/actions/transactions';
import { type SavingsAccount } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export function AccountStatementGenerator({ savingsAccounts }: { savingsAccounts: SavingsAccount[] }) {
    const { toast } = useToast();
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });
    const [transactions, setTransactions] = useState<Transaction[] | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!selectedAccountId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a savings account.' });
            return;
        }
        if (!date?.from || !date?.to) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a valid date range.' });
            return;
        }

        setLoading(true);
        setTransactions(null);
        try {
            const result = await getTransactionHistory({
                savingsAccountId: selectedAccountId,
                startDate: format(date.from, 'yyyy-MM-dd'),
                endDate: format(date.to, 'yyyy-MM-dd'),
            });
            setTransactions(result);
            if (result.length === 0) {
                toast({ title: 'No transactions found for the selected period.' });
            }
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    const handleExport = async () => {
        if (!selectedAccountId || !date?.from || !date?.to) return;
        setLoading(true);
        try {
            const csvString = await exportTransactionsToCsv({
                savingsAccountId: selectedAccountId,
                startDate: format(date.from, 'yyyy-MM-dd'),
                endDate: format(date.to, 'yyyy-MM-dd'),
            });
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `statement-${selectedAccountId}-${format(date.from, 'yyyy-MM-dd')}.csv`;
            link.click();
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Account Statement</CardTitle>
                <CardDescription>Generate a statement for a specific savings account and date range.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="account">Savings Account</Label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                                {savingsAccounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.schemeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Date range</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn( "w-full justify-start text-left font-normal", !date && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                date.to ? (
                                    <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    </>
                                ) : (
                                    format(date.from, "LLL dd, y")
                                )
                                ) : (
                                <span>Pick a date</span>
                                )}
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={setDate}
                                numberOfMonths={2}
                            />
                            </PopoverContent>
                        </Popover>
                    </div>
                </div>
                <div>
                     <Button onClick={handleSearch} disabled={loading} className="w-full sm:w-auto">
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Generate Statement
                    </Button>
                </div>
            </CardContent>
            {transactions && (
                <>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead className="text-right">Debit</TableHead>
                                    <TableHead className="text-right">Credit</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map(tx => (
                                    <TableRow key={tx.id}>
                                        <TableCell className="text-xs">{new Date(tx.date).toLocaleDateString()}</TableCell>
                                        <TableCell>{tx.description}</TableCell>
                                        <TableCell className="text-right font-mono">{tx.type === 'debit' ? `₹${tx.amount.toFixed(2)}` : '-'}</TableCell>
                                        <TableCell className="text-right font-mono">{tx.type === 'credit' ? `₹${tx.amount.toFixed(2)}` : '-'}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <Button variant="secondary" onClick={handleExport} disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                            Export as CSV
                        </Button>
                    </CardFooter>
                </>
            )}
        </Card>
    );
}
