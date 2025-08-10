
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { getMemberTickets } from '@/actions/support';
import type { SupportTicket, TicketStatus } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';

export function MyTicketsList() {
    const { toast } = useToast();
    const router = useRouter();
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            setLoading(true);
            try {
                const data = await getMemberTickets();
                setTickets(data);
            } catch (error: any) {
                toast({ variant: 'destructive', title: 'Error', description: error.message });
            } finally {
                setLoading(false);
            }
        };
        fetchTickets();
    }, [toast]);

    const handleRowClick = (ticketId: string) => {
        router.push(`/dashboard/support/${ticketId}`);
    };

    const getStatusVariant = (status: TicketStatus) => {
        switch (status) {
            case 'Open': return 'destructive';
            case 'In Progress': return 'secondary';
            case 'Resolved':
            case 'Closed': return 'default';
            default: return 'outline';
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>My Support Tickets</CardTitle>
                <CardDescription>A history of all your support requests.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Subject</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            Array.from({ length: 3 }).map((_, i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                    <TableCell><Skeleton className="h-4 w-full" /></TableCell>
                                </TableRow>
                            ))
                        ) : tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} onClick={() => handleRowClick(ticket.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{ticket.subject}</TableCell>
                                    <TableCell>{ticket.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell>{ticket.updatedAt}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center h-24">
                                    You have not created any support tickets.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
