
import { FcmTokenManager } from '@/components/fcm-token-manager';
import Link from 'next/link';
import { Home, UserCircle, Wallet, History, FileText, LifeBuoy, Settings, PlusCircle, Landmark, PiggyBank, Banknote as SavingsIcon } from 'lucide-react';
import { Sidebar, SidebarProvider, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarContent, SidebarTrigger, SidebarInset, SidebarMenuSub, SidebarMenuSubItem, SidebarMenuSubButton } from '@/components/ui/sidebar';
import { UserNav } from '@/components/user-nav';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

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
              <SidebarMenuButton asChild tooltip="My Accounts">
                <Link href="/dashboard/accounts">
                  <Wallet />
                  <span>My Accounts</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

             <Collapsible>
                <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                         <Button variant="ghost" className="w-full justify-start px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                            <PlusCircle />
                            <span className="group-data-[collapsible=icon]:hidden flex-1 text-left ml-2">New Application</span>
                            <span className="sr-only">New Application</span>
                        </Button>
                    </CollapsibleTrigger>
                </SidebarMenuItem>
                <CollapsibleContent asChild>
                    <SidebarMenuSub>
                        <SidebarMenuSubItem>
                            <SidebarMenuSubButton asChild>
                                <Link href="/dashboard/apply-savings">Savings Account</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                        <SidebarMenuSubItem>
                             <SidebarMenuSubButton asChild>
                                <Link href="/dashboard/apply-loan">Loan Account</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                         <SidebarMenuSubItem>
                             <SidebarMenuSubButton asChild>
                                <Link href="/dashboard/apply-deposit">Deposit Account</Link>
                            </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>

            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Documents & Statements">
                <Link href="/dashboard/documents">
                  <FileText />
                  <span>Documents</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Support">
                <Link href="/dashboard/support">
                  <LifeBuoy />
                  <span>Support</span>
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
              <SidebarMenuButton asChild tooltip="Security">
                <Link href="/dashboard/security">
                  <Settings />
                  <span>Security</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background px-4 lg:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger />
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
