
import { NotificationComposer } from "@/components/admin/notifications/notification-composer"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Notifications & Communication</h1>
        <p className="text-muted-foreground">
          Send push notifications to your members via Firebase Cloud Messaging.
        </p>
      </div>

      <NotificationComposer />
      
    </div>
  )
}
