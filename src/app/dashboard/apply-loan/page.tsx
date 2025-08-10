
"use client";

import { useEffect, useState } from "react";
import { getAvailableLoanProducts } from "@/actions/loans";
import { ApplyForLoanForm } from "@/components/dashboard/apply-loan-form";
import type { LoanProduct } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";

export default function ApplyForLoanPage() {
    const [products, setProducts] = useState<LoanProduct[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAvailableLoanProducts().then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
            <p className="text-muted-foreground">Fill out the form below to apply for a loan.</p>
        </header>

        {loading ? (
            <Card className="max-w-2xl">
                <CardHeader>
                    <Skeleton className="h-8 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent className="space-y-6">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        ) : (
            <ApplyForLoanForm products={products} />
        )}
      </div>
    );
}
