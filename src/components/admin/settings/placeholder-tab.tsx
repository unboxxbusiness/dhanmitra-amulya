
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from 'lucide-react';

interface PlaceholderTabProps {
    title: string;
    description: string;
}

export function PlaceholderTab({ title, description }: PlaceholderTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="flex flex-col items-center justify-center h-48 text-center p-4 border-2 border-dashed rounded-lg">
                    <Construction className="w-12 h-12 text-muted-foreground" />
                    <p className="mt-4 text-sm text-muted-foreground">This feature is under construction and will be available in a future update.</p>
                </div>
            </CardContent>
        </Card>
    )
}
