
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Construction } from 'lucide-react';

interface PlaceholderReportProps {
    title: string;
    description: string;
}

export function PlaceholderReport({ title, description }: PlaceholderReportProps) {
    return (
        <Card className="flex flex-col">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
                 <div className="flex flex-col items-center justify-center h-full text-center p-4 border-2 border-dashed rounded-lg">
                    <Construction className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">This report is under construction and will be available in a future update.</p>
                </div>
            </CardContent>
            <CardFooter>
                 <Button disabled className="w-full">
                    Coming Soon
                </Button>
            </CardFooter>
        </Card>
    )
}
