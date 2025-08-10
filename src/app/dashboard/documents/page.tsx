
"use client";

import { useState, useEffect } from 'react';
import { AccountStatementGenerator } from "@/components/dashboard/documents/account-statement-generator";
import { InterestCertificate } from "@/components/dashboard/documents/interest-certificate";
import { LoanClosureCertificate } from "@/components/dashboard/documents/loan-closure-certificate";
import { getMemberFinancials } from "@/actions/users";
import { Skeleton } from "@/components/ui/skeleton";
import type { MemberFinancials } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

export default function DocumentsPage() {
    const [financials, setFinancials] = useState<MemberFinancials | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchFinancials = async () => {
            try {
                const data = await getMemberFinancials();
                setFinancials(data);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error loading data",
                    description: error.message
                })
            } finally {
                setLoading(false);
            }
        };
        fetchFinancials();
    }, [toast]);

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Documents & Statements</h1>
            <p className="text-muted-foreground">Generate and download your account statements and certificates.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
                {loading ? <Skeleton className="h-[200px] w-full" /> : <AccountStatementGenerator savingsAccounts={financials?.savingsAccounts || []} />}
                {loading ? <Skeleton className="h-[200px] w-full" /> : <InterestCertificate />}
            </div>
            <div>
                {loading ? <Skeleton className="h-[200px] w-full" /> : <LoanClosureCertificate loans={financials?.activeLoans || []} />}
            </div>
        </div>
      </div>
    );
}
