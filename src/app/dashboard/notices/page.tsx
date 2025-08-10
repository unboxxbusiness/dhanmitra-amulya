
import { getMemberNotifications } from "@/actions/notifications";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Bell } from "lucide-react";

export default async function NoticesPage() {
    const notices = await getMemberNotifications();

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
                    {notices.length > 0 ? (
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
