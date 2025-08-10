
import { FcmTokenManager } from '@/components/fcm-token-manager';
import Link from 'next/link';
import { Home, Landmark, PiggyBank, UserCircle } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarContent className="p-2">
            <div className="p-2 flex items-center gap-2">
                 <SidebarTrigger className="shrink-0 md:hidden" />
                 <h2 className="font-bold text-lg text-sidebar-primary group-data-[collapsible=icon]:hidden">Amulya Member</h2>
            </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/dashboard">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Profile">
                <Link href="/dashboard/profile">
                  <UserCircle />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Apply for Loan">
                <Link href="/dashboard/apply-loan">
                  <Landmark />
                  <span>Apply for Loan</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Apply for Deposit">
                <Link href="/dashboard/apply-deposit">
                  <PiggyBank />
                  <span>Apply for Deposit</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="hidden md:flex" />
                <div className="flex-1 font-semibold">
                    Member Portal
                </div>
            </div>
             <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
             <FcmTokenManager />
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
