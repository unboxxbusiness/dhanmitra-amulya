
import { getAllTickets } from "@/actions/support";
import { AdminSupportTicketsClient } from "@/components/admin/support/admin-support-tickets-client";

export default async function AdminSupportPage() {
    const tickets = await getAllTickets();

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Support Tickets</h1>
                <p className="text-muted-foreground">
                    View and respond to member support requests.
                </p>
            </div>
            <AdminSupportTicketsClient tickets={tickets} />
        </div>
    );
}
