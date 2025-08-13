
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { getMemberGrowthData } from "@/actions/analytics";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export function MemberGrowthChart() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        getMemberGrowthData()
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
                <CardTitle>Member Growth Over Time</CardTitle>
                <CardDescription>Cumulative member count by month.</CardDescription>
            </CardHeader>
            <CardContent>
                 <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis yAxisId="left" />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip />
                        <Legend />
                        <Line yAxisId="left" type="monotone" dataKey="Total Members" stroke="hsl(var(--primary))" strokeWidth={2} name="Total Members" />
                         <Line yAxisId="right" type="monotone" dataKey="New Members" stroke="hsl(var(--accent))" name="New Members/Month" />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
