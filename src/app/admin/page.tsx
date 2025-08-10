import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ShieldCheck } from 'lucide-react';

export default async function AdminPage() {
  const session = await getSession();

  if (!session || !session.isAdmin) {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">admin</h1>
        <p className="text-muted-foreground">Manage your application from this secure control center.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Admin-only Area</CardTitle>
          <CardDescription>This page is only accessible to administrators.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="bg-primary/5 border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary" />
            <AlertTitle className="text-primary">You have admin privileges!</AlertTitle>
            <AlertDescription>
              Welcome, Admin {session.name || session.email}. You can perform administrative tasks here.
            </AlertDescription>
          </Alert>
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold">System Status</h3>
            <p className="text-sm text-muted-foreground mt-2">All systems are currently operational.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
