
'use client';

import { useState, useEffect } from 'react';
import { getTicketById } from "@/actions/support";
import { AdminTicketDetails } from "@/components/admin/support/admin-ticket-details";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal, Loader2 } from "lucide-react";
import type { SupportTicket } from '@/lib/definitions';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';

export default function AdminTicketDetailsPage({ params }: { params: { ticketId: string } }) {
    const [ticket, setTicket] = useState<SupportTicket | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();

    const fetchTicket = async () => {
        try {
            const ticketData = await getTicketById(params.ticketId);
            if (!ticketData) {
                setError(`The ticket with ID ${params.ticketId} could not be found.`);
            } else {
                setTicket(ticketData);
            }
        } catch (e: any) {
            setError(e.message);
            toast({ variant: 'destructive', title: 'Error', description: e.message });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchTicket();
    }, [params.ticketId]);

    const onUpdate = () => {
        // Re-fetch the ticket data to show the latest updates
        fetchTicket();
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        )
    }

    if (error) {
        return (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Error Loading Ticket</AlertTitle>
                <AlertDescription>
                    {error}
                </AlertDescription>
            </Alert>
        )
    }

    if (!ticket) {
        return null; // Or some other placeholder
    }

    return <AdminTicketDetails ticket={ticket} onUpdate={onUpdate} />;
}
