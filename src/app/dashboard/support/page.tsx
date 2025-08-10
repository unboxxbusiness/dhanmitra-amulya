
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateTicketForm } from "@/components/dashboard/support/create-ticket-form";
import { MyTicketsList } from "@/components/dashboard/support/my-tickets-list";

export default function SupportPage() {
    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
                <p className="text-muted-foreground">
                    Raise a new support ticket or view the status of your existing ones.
                </p>
            </header>

            <Tabs defaultValue="new-ticket" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="new-ticket">New Ticket</TabsTrigger>
                    <TabsTrigger value="my-tickets">My Tickets</TabsTrigger>
                </TabsList>
                <TabsContent value="new-ticket">
                    <CreateTicketForm />
                </TabsContent>
                <TabsContent value="my-tickets">
                    <MyTicketsList />
                </TabsContent>
            </Tabs>
        </div>
    );
}
