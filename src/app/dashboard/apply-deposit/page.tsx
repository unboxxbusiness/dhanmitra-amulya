
"use client";

import { getAvailableDepositProducts } from "@/actions/deposits";
import { ApplyForDepositForm } from "@/components/dashboard/apply-deposit-form";
import { useEffect, useState } from "react";
import type { DepositProduct } from "@/lib/definitions";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";


export default function ApplyForDepositPage() {
    const [products, setProducts] = useState<DepositProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAvailableDepositProducts();
                setProducts(data);
            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "Error loading products",
                    description: error.message
                })
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [toast]);

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Apply for a Deposit</h1>
            <p className="text-muted-foreground">Choose a product and start your investment.</p>
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
        ) : <ApplyForDepositForm products={products} />}
      </div>
    );
}
