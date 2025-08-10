
'use client';

import { useState, useEffect } from "react";
import { getMemberLoanHistory } from "@/actions/loans";
import { PaymentHistoryClient } from "@/components/dashboard/payment-history-client";
import { Skeleton } from "@/components/ui/skeleton";
import type { RepaymentWithLoanDetails } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";

export default function PaymentHistoryPage() {
    const [history, setHistory] = useState<RepaymentWithLoanDetails[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const data = await getMemberLoanHistory();
                setHistory(data);
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

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Loan Payment History</h1>
            <p className="text-muted-foreground">A complete record of all your loan repayments.</p>
        </header>

        {loading ? (
            <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-10 w-32" />
            </div>
        ) : (
            <PaymentHistoryClient history={history} />
        )}
      </div>
    );
}
