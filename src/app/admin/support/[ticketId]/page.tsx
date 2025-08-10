
import { getTicketById } from "@/actions/support";
import { AdminTicketDetails } from "@/components/admin/support/admin-ticket-details";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default async function AdminTicketDetailsPage({ params }: { params: { ticketId: string } }) {
    const ticket = await getTicketById(params.ticketId);

    if (!ticket) {
        return (
             <Alert variant="destructive">
                <Terminal className="h-4 w-4" />
                <AlertTitle>Ticket Not Found</AlertTitle>
                <AlertDescription>
                    The ticket with ID {params.ticketId} could not be found.
                </AlertDescription>
            </Alert>
        )
    }

    return <AdminTicketDetails ticket={ticket} />;
}
