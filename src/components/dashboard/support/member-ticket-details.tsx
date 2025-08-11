
'use client';

import { useState, useRef, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { addTicketReply } from '@/actions/support';
import type { SupportTicket, TicketStatus } from '@/lib/definitions';
import { Loader2, Send } from 'lucide-react';
import { getSession } from '@/lib/auth';
import type { UserSession } from '@/lib/definitions';
import { cn } from '@/lib/utils';
import { ArrowLeft } from 'lucide-react';

interface MemberTicketDetailsProps {
    ticket: SupportTicket;
}

const ReplyForm = ({ ticketId }: { ticketId: string }) => {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();

    const handleFormAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await addTicketReply(ticketId, formData);
            if (result.success) {
                toast({ title: "Reply Sent" });
                formRef.current?.reset();
            } else if (result.error) {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
        });
    };

    return (
        <form ref={formRef} action={handleFormAction}>
            <Textarea
                name="message"
                placeholder="Type your reply..."
                required
                className="min-h-[100px]"
            />
            <Button type="submit" disabled={isPending} className="mt-2">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                Send Reply
            </Button>
        </form>
    );
};


export function MemberTicketDetails({ ticket }: MemberTicketDetailsProps) {
    const [session, setSession] = useState<UserSession | null>(null);

    useEffect(() => {
        getSession().then(setSession);
    }, []);

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
        <div className="space-y-6">
            <Button asChild variant="outline" size="sm">
                <Link href="/dashboard/support">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to My Tickets
                </Link>
            </Button>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{ticket.subject}</CardTitle>
                            <CardDescription>
                                Ticket ID: <span className="font-mono">{ticket.id}</span>
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p>{ticket.message}</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Conversation</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {ticket.replies?.map(reply => (
                                <div
                                    key={reply.replyId}
                                    className={cn(
                                        "p-3 rounded-lg",
                                        reply.authorId === session?.uid ? "bg-primary/10" : "bg-muted"
                                    )}
                                >
                                    <p className="font-semibold text-sm">{reply.authorName}</p>
                                    <p className="text-muted-foreground text-xs mb-1">{new Date(reply.createdAt).toLocaleString()}</p>
                                    <p>{reply.message}</p>
                                </div>
                            ))}
                             {ticket.status !== 'Closed' && ticket.status !== 'Resolved' && (
                                <ReplyForm ticketId={ticket.id} />
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <span>{ticket.category}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Created</span>
                                <span>{new Date(ticket.createdAt).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Status</span>
                                <Badge variant={getStatusVariant(ticket.status)}>{ticket.status}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
