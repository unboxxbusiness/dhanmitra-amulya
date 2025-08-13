
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getLoanDepositTrendData } from "@/actions/analytics";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function LoanDepositChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getLoanDepositTrendData()
            .then(setData)
            .catch(err => toast({ variant: 'destructive', title: 'Error', description: err.message }))
            .finally(() => setLoading(false));
    }, [toast]);
    
    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-3/4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-[300px] w-full" />
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Loan vs. Deposit Trends</CardTitle>
                <CardDescription>Monthly comparison of new loans and deposits.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `₹${new Intl.NumberFormat('en-IN', { notation: 'compact' }).format(value as number)}`}/>
                        <Tooltip formatter={(value) => `₹${(value as number).toLocaleString('en-IN')}`}/>
                        <Legend />
                        <Bar dataKey="Loans Disbursed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Deposits Made" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
