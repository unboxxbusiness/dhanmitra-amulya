

'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllTickets } from "@/actions/support";
import { AdminSupportTicketsClient } from "@/components/admin/support/admin-support-tickets-client";
import type { SupportTicket } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { DataTablePagination } from '@/components/data-table-pagination';

export default function AdminSupportPage() {
    const { toast } = useToast();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(false);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const data = await getAllTickets({ page, pageSize });
            setTickets(data.tickets);
            setTotalCount(data.totalCount);
            setHasMore(data.hasMore);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }, [toast, page, pageSize]);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                <p className="text-muted-foreground">
                    View and respond to member support requests.
                </p>
            </div>
            <Card>
                <CardContent className="pt-6">
                     {loading ? (
                        <div className="space-y-2">
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ) : (
                        <AdminSupportTicketsClient tickets={tickets} />
                    )}
                </CardContent>
                <CardFooter>
                    <DataTablePagination 
                        page={page}
                        setPage={setPage}
                        pageSize={pageSize}
                        setPageSize={setPageSize}
                        totalCount={totalCount}
                        hasMore={hasMore}
                    />
                </CardFooter>
            </Card>
        </div>
    );
}
