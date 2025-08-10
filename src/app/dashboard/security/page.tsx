
import { ChangePasswordCard } from "@/components/dashboard/security/change-password-card";
import { SessionManagementCard } from "@/components/dashboard/security/session-management-card";


export default function SecurityPage() {

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Security Settings</h1>
            <p className="text-muted-foreground">Manage your password and active sessions.</p>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
            <ChangePasswordCard />
            <SessionManagementCard />
        </div>

      </div>
    );
}
