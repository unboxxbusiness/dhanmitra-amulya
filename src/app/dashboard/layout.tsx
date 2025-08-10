
import { FcmTokenManager } from '@/components/fcm-token-manager';
import Link from 'next/link';
import { Home, Landmark, PiggyBank, UserCircle, Wallet, ArrowLeftRight, ChevronDown, History, FileText, Bell } from 'lucide-react';
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
              <SidebarMenuButton asChild tooltip="Profile">
                <Link href="/dashboard/profile">
                  <UserCircle />
                  <span>Profile</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Notices">
                <Link href="/dashboard/notices">
                  <Bell />
                  <span>Notices</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <Collapsible>
                <>
                    <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                             <Button variant="ghost" className="w-full justify-start px-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
                                <Wallet />
                                <span className="group-data-[collapsible=icon]:hidden flex-1 text-left ml-2">My Accounts</span>
                                <ChevronDown className="h-4 w-4 group-data-[collapsible=icon]:hidden" />
                            </Button>
                        </CollapsibleTrigger>
                    </SidebarMenuItem>
                    <CollapsibleContent asChild>
                        <SidebarMenuSub>
                            <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild>
                                    <Link href="/dashboard#accounts">Savings Accounts</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                             <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild>
                                    <Link href="/dashboard#loans">Loan Accounts</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            <SidebarMenuSubItem>
                                 <SidebarMenuSubButton asChild>
                                    <Link href="/dashboard#deposits">Deposit Accounts</Link>
                                </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                        </SidebarMenuSub>
                    </CollapsibleContent>
                </>
            </Collapsible>
            
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Transactions">
                <Link href="/dashboard#transactions">
                  <ArrowLeftRight />
                  <span>Transactions</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Payment History">
                <Link href="/dashboard/payment-history">
                  <History />
                  <span>Payment History</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Documents & Statements">
                <Link href="/dashboard/documents">
                  <FileText />
                  <span>Documents & Statements</span>
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
