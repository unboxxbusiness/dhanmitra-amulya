
"use client";

import { useEffect, useState } from "react";
import { getAvailableSavingsSchemes } from "@/actions/savings";
import type { SavingsScheme } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { ApplyForSavingsForm } from "@/components/dashboard/apply-savings-form";

export default function ApplyForSavingsPage() {
    const [schemes, setSchemes] = useState<SavingsScheme[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchSchemes = async () => {
            try {
                const data = await getAvailableSavingsSchemes();
                setSchemes(data);
            } catch (error: any) {
                 toast({
                    variant: "destructive",
                    title: "Error loading schemes",
                    description: error.message
                })
            } finally {
                setLoading(false);
            }
        };
        fetchSchemes();
    }, [toast]);

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Apply for a Savings Account</h1>
            <p className="text-muted-foreground">Choose a scheme that fits your goals and start saving.</p>
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
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-32" />
                </CardFooter>
            </Card>
        ) : <ApplyForSavingsForm schemes={schemes} />}
      </div>
    );
}
