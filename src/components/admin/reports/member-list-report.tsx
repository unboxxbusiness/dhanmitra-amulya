
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { exportMembersToCsv } from '@/actions/users';

export function MemberListReport() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleExport = async () => {
        setLoading(true);
        try {
            const csvString = await exportMembersToCsv();
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', 'member-list.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({ title: 'Success', description: 'Member list exported.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        }
        setLoading(false);
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Member List</CardTitle>
                <CardDescription>A complete list of all members in the cooperative, including their role and status.</CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">Click the button below to download the full member list as a CSV file.</p>
            </CardContent>
            <CardFooter>
                <Button onClick={handleExport} disabled={loading} className="w-full">
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
                    Export as CSV
                </Button>
            </CardFooter>
        </Card>
    )
}
