'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from '@/actions/auth';
import type { UserSession } from '@/lib/definitions';
import { LogOut, LayoutDashboard, UserCog } from 'lucide-react';
import Link from 'next/link';
import { getSession } from '@/lib/auth';
import { useEffect, useState } from 'react';

const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];

export function UserNav() {
  const [session, setSession] = useState<UserSession | null>(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  const getInitials = (name: string) => {
    return name.split(' ').map((n) => n[0]).join('');
  };
  
  if (!session) {
    return (
      <Button asChild variant="ghost">
        <Link href="/login">Login</Link>
      </Button>
    )
  }
  
  const isPrivilegedUser = ADMIN_ROLES.includes(session.role);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.picture ?? ''} alt={session.name ?? 'User'} />
            <AvatarFallback>{getInitials(session.name ?? 'U')}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{session.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {session.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={isPrivilegedUser ? "/admin" : "/dashboard"}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
