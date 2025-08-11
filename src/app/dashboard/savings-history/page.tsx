
'use client';

import { useState, useEffect } from "react";
import { getTransactionHistory } from "@/actions/transactions";
import { SavingsHistoryClient } from "@/components/dashboard/savings-history-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { Transaction } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { getMemberFinancials } from "@/actions/users";
import type { SavingsAccount } from "@/lib/definitions";

export default function SavingsHistoryPage() {
    const [history, setHistory] = useState<Transaction[]>([]);
    const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const financials = await getMemberFinancials();
                setAccounts(financials.savingsAccounts);
                if (financials.savingsAccounts.length > 0) {
                    // Fetch history for all accounts initially
                    const data = await getTransactionHistory({});
                    setHistory(data);
                }
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error loading history",
                    description: error.message,
                });
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [toast]);
    
    const onSearch = async (accountId: string, date: {from: Date, to: Date}) => {
        setLoading(true);
        try {
            const data = await getTransactionHistory({
                accountId: accountId,
                startDate: date.from.toISOString(),
                endDate: date.to.toISOString(),
            });
            setHistory(data);
            if(data.length === 0) {
                toast({ title: 'No transactions found for the selected period.'});
            }
        } catch (error: any) {
            toast({
                variant: "destructive",
                title: "Error fetching history",
                description: error.message,
            });
        } finally {
            setLoading(false);
        }
    }


    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Savings Transaction History</h1>
            <p className="text-muted-foreground">A complete record of all your savings account transactions.</p>
        </header>

        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        ) : (
            <SavingsHistoryClient
                history={history}
                accounts={accounts}
                onSearch={onSearch}
                isLoading={loading}
            />
        )}
      </div>
    );
}
