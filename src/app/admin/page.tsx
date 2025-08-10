
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck, Users, Clock } from 'lucide-react';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !ADMIN_ROLES.includes(session.role)) {
    redirect('/dashboard');
  }

  // Placeholder data
  const stats = {
    totalMembers: 1250,
    pendingApplications: 15,
  }

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">An overview of your cooperative's status.</p>
      </header>
      
      <Alert className="bg-primary/5 border-primary/20">
        <ShieldCheck className="h-4 w-4 text-primary" />
        <AlertTitle className="text-primary capitalize">Welcome, {session.role.replace('_', ' ')}</AlertTitle>
        <AlertDescription>
          You are logged in as {session.name || session.email}. You can manage the application from this control center.
        </AlertDescription>
      </Alert>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMembers}</div>
            <p className="text-xs text-muted-foreground">+50 from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Applications</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.pendingApplications}</div>
            <p className="text-xs text-muted-foreground">Awaiting review</p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>All systems are currently operational.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-2 p-4 border rounded-lg">
            <h3 className="font-semibold">Quick Access</h3>
            <p className="text-sm text-muted-foreground mt-2">Use the sidebar to navigate to different management sections.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
