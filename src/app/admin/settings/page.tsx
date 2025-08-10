
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettingsTab } from "@/components/admin/settings/general-settings-tab"
import { ComplianceTab } from "@/components/admin/settings/compliance-tab"
import { BranchesTab } from "@/components/admin/settings/branches-tab";
import { HolidaysTab } from "@/components/admin/settings/holidays-tab";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings & Compliance</h1>
        <p className="text-muted-foreground">
          Manage society-wide configurations, policies, and compliance settings.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettingsTab />
        </TabsContent>
         <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>
         <TabsContent value="holidays">
          <HolidaysTab />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
