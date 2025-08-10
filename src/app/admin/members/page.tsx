
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AllMembersTab } from "@/components/admin/all-members-tab"
import { PendingApplicationsTab } from "@/components/admin/pending-applications-tab"
import { BulkActionsTab } from "@/components/admin/bulk-actions-tab"

export default function MemberManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Member Management</h1>
        <p className="text-muted-foreground">
          View, manage, and approve member accounts and applications.
        </p>
      </div>

      <Tabs defaultValue="all-members" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-members">All Members</TabsTrigger>
          <TabsTrigger value="pending-applications">Pending Applications</TabsTrigger>
          <TabsTrigger value="bulk-actions">Bulk Actions</TabsTrigger>
        </TabsList>
        <TabsContent value="all-members">
            <AllMembersTab />
        </TabsContent>
        <TabsContent value="pending-applications">
            <PendingApplicationsTab />
        </TabsContent>
        <TabsContent value="bulk-actions">
            <BulkActionsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

