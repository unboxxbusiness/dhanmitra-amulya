import Link from 'next/link';
import { ShieldCheck } from 'lucide-react';
import { getSession } from '@/lib/auth';
import { UserNav } from './user-nav';
import { Button } from './ui/button';

export async function Header() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <span className="hidden font-bold sm:inline-block">Amulya</span>
        </Link>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <nav className="flex items-center space-x-1">
            {session ? (
              <UserNav session={session} />
            ) : (
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
