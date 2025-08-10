import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default async function DashboardPage() {
  const session = await getSession();

  // This check is redundant due to middleware but provides an extra layer of server-side security.
  if (!session) {
    redirect('/login');
  }
  
  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">user dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's your personalized space.</p>
      </header>
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
           <Avatar className="h-16 w-16 border-2 border-primary">
            <AvatarImage src={session.picture ?? ''} alt={session.name ?? 'User'} />
            <AvatarFallback className="text-2xl">{getInitials(session.name ?? 'U')}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-2xl">{session.name || 'User'}</CardTitle>
            <CardDescription>{session.email}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold">Your Details</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">UID:</span> {session.uid}
            </p>
             <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Role:</span> {session.isAdmin ? 'Admin' : 'User'}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
