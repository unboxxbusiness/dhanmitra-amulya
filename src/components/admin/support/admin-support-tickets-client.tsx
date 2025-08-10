
'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import type { SupportTicket, TicketStatus } from '@/lib/definitions';

interface AdminSupportTicketsClientProps {
    tickets: SupportTicket[];
}

export function AdminSupportTicketsClient({ tickets }: AdminSupportTicketsClientProps) {
    const router = useRouter();

    const handleRowClick = (ticketId: string) => {
        router.push(`/admin/support/${ticketId}`);
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
                <CardTitle>All Tickets</CardTitle>
                <CardDescription>A list of all support tickets from members.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Member</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Updated</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tickets.length > 0 ? (
                            tickets.map((ticket) => (
                                <TableRow key={ticket.id} onClick={() => handleRowClick(ticket.id)} className="cursor-pointer">
                                    <TableCell className="font-medium">{ticket.userName}</TableCell>
                                    <TableCell>{ticket.subject}</TableCell>
                                    <TableCell>{ticket.category}</TableCell>
                                    <TableCell>
                                        <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                                    </TableCell>
                                    <TableCell>{ticket.updatedAt}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">
                                    No support tickets found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
}
