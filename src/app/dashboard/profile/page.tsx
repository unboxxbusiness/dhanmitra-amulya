
import { getMemberProfile } from "@/actions/users";
import { ProfileForm } from "@/components/dashboard/profile-form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { Terminal } from "lucide-react";

export default async function ProfilePage() {
    
    let profile;
    let error;
    try {
        profile = await getMemberProfile();
    } catch (e: any) {
        error = e.message;
    }

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Member Profile</h1>
            <p className="text-muted-foreground">View and manage your personal information.</p>
        </header>

        {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error Loading Profile</AlertTitle>
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
        )}

        {profile && <ProfileForm profile={profile} />}

      </div>
    );
}
