
"use client";

import { useState, useEffect } from "react";
import { getMemberNotifications } from "@/actions/notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bell, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";


export default function NoticesPage() {
    const { toast } = useToast();
    const [notices, setNotices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNotices = async () => {
            setLoading(true);
            try {
                const data = await getMemberNotifications();
                setNotices(data);
            } catch (error: any) {
                toast({
                    variant: "destructive",
                    title: "Error loading notices",
                    description: error.message
                });
            } finally {
                setLoading(false);
            }
        };
        fetchNotices();
    }, [toast]);


    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Notices & Messages</h1>
                <p className="text-muted-foreground">A history of all communications sent by the society.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle>Notification History</CardTitle>
                    <CardDescription>Messages are sorted with the most recent first.</CardDescription>
                </CardHeader>
                <CardContent>
                    {loading ? (
                         <div className="space-y-4">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <Skeleton className="h-10 w-10 rounded-full" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-3/4" />
                                        <Skeleton className="h-4 w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : notices.length > 0 ? (
                        <div className="space-y-4">
                            {notices.map((notice: any) => (
                                <div key={notice.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <div className="bg-primary/10 p-2 rounded-full">
                                        <Bell className="h-5 w-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-baseline">
                                            <h3 className="font-semibold">{notice.title}</h3>
                                            <p className="text-xs text-muted-foreground">{new Date(notice.sentAt).toLocaleString()}</p>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">{notice.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-muted-foreground py-16">
                            <p>You have no notices.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
