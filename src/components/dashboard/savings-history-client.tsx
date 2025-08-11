
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { exportTransactionsToCsv } from "@/actions/transactions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Download, Search, Calendar as CalendarIcon } from "lucide-react";
import type { Transaction, SavingsAccount } from "@/lib/definitions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DateRange } from 'react-day-picker';
import { subDays, format } from 'date-fns';
import { Calendar } from '../ui/calendar';
import { cn } from '@/lib/utils';
import { Label } from '../ui/label';

interface SavingsHistoryClientProps {
    history: Transaction[];
    accounts: SavingsAccount[];
    onSearch: (accountId: string, date: { from: Date, to: Date }) => void;
    isLoading: boolean;
}

export function SavingsHistoryClient({ history, accounts, onSearch, isLoading }: SavingsHistoryClientProps) {
    const { toast } = useToast();
    const [isExporting, setIsExporting] = useState(false);
    
    const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');
    const [date, setDate] = useState<DateRange | undefined>({
        from: subDays(new Date(), 30),
        to: new Date(),
    });


    const handleExport = async () => {
        if (!selectedAccountId || !date?.from || !date?.to) {
            toast({ variant: 'destructive', title: 'Please select an account and date range to export.'});
            return;
        }
        setIsExporting(true);
        try {
            const csvString = await exportTransactionsToCsv({ 
                savingsAccountId: selectedAccountId,
                startDate: format(date.from, 'yyyy-MM-dd'),
                endDate: format(date.to, 'yyyy-MM-dd')
            });
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', `savings-history-${selectedAccountId}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Export Successful', description: 'Your savings history has been downloaded.' });
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: error.message || 'Could not export data.',
            });
        } finally {
            setIsExporting(false);
        }
    };
    
    const handleSearch = () => {
        if (!selectedAccountId || !date?.from || !date?.to) {
            toast({ variant: 'destructive', title: 'Please select an account and a valid date range.'});
            return;
        }
        onSearch(selectedAccountId, { from: date.from, to: date.to });
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Filter History</CardTitle>
                <div className="flex flex-wrap items-end gap-4">
                     <div className="space-y-2 flex-grow">
                        <Label htmlFor="account">Savings Account</Label>
                        <Select value={selectedAccountId} onValueChange={setSelectedAccountId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an account" />
                            </SelectTrigger>
                            <SelectContent>
                                {accounts.map(acc => (
                                    <SelectItem key={acc.id} value={acc.id}>
                                        {acc.schemeName}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2 flex-grow">
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
                     <Button onClick={handleSearch} disabled={isLoading}>
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                        Search
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                             <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                            <TableHead className="text-right">Balance After</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                             Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={i}><TableCell colSpan={5}><Skeleton className="h-8 w-full"/></TableCell></TableRow>
                            ))
                        ) : history.length > 0 ? history.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>
                                    <Badge variant={item.type === 'credit' ? 'default' : 'destructive'} className="capitalize">
                                        {item.type}
                                    </Badge>
                                </TableCell>
                                <TableCell className={`text-right font-mono ${item.type === 'credit' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.type === 'credit' ? '+' : '-'}₹{item.amount.toFixed(2)}
                                </TableCell>
                                <TableCell className="text-right font-mono">₹{item.balanceAfter.toFixed(2)}</TableCell>
                            </TableRow>
                        )) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No transaction history found for the selected criteria.
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
