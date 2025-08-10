
import Link from 'next/link';
import { Home, Users, Settings, Banknote, PiggyBank, Landmark, ArrowLeftRight, BookCopy, FileSpreadsheet, MessageSquare, LifeBuoy } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Button } from '@/components/ui/button';

export default function AdminLayout({
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
                 <h2 className="font-bold text-lg text-sidebar-primary group-data-[collapsible=icon]:hidden">Amulya Admin</h2>
            </div>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Dashboard">
                <Link href="/admin">
                  <Home />
                  <span>Dashboard</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Member Management">
                <Link href="/admin/members">
                  <Users />
                  <span>Member Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Savings Management">
                <Link href="/admin/savings">
                  <Banknote />
                  <span>Savings Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Deposit Management">
                <Link href="/admin/deposits">
                  <PiggyBank />
                  <span>Deposit Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Loan Management">
                <Link href="/admin/loans">
                  <Landmark />
                  <span>Loan Management</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Transactions">
                <Link href="/admin/transactions">
                  <ArrowLeftRight />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Accounting">
                <Link href="/admin/accounting">
                  <BookCopy />
                  <span>Accounting</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Reports">
                <Link href="/admin/reports">
                  <FileSpreadsheet />
                  <span>Reports</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Notifications">
                <Link href="/admin/notifications">
                  <MessageSquare />
                  <span>Notifications</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Support Tickets">
                <Link href="/admin/support">
                  <LifeBuoy />
                  <span>Support Tickets</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Integrations">
                <Link href="/admin/integrations">
                  <Landmark />
                  <span>Integrations</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Settings">
                <Link href="/admin/settings">
                  <Settings />
                  <span>Settings</span>
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
                    Admin Panel
                </div>
            </div>
             <UserNav />
        </header>
        <main className="flex-1 p-4 md:p-8 overflow-auto">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
