
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettingsTab } from "@/components/admin/settings/general-settings-tab"
import { ComplianceTab } from "@/components/admin/settings/compliance-tab"
import { PlaceholderTab } from "@/components/admin/settings/placeholder-tab"

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
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettingsTab />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTab />
        </TabsContent>
        <TabsContent value="branches">
          <PlaceholderTab title="Branch Setup" description="Manage your cooperative's branches."/>
        </TabsContent>
         <TabsContent value="holidays">
          <PlaceholderTab title="Holiday Calendar" description="Define the holiday calendar for the year."/>
        </TabsContent>
      </Tabs>
    </div>
  )
}
