

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeneralSettingsTab } from "@/components/admin/settings/general-settings-tab"
import { ComplianceTab } from "@/components/admin/settings/compliance-tab"
import { BranchesTab } from "@/components/admin/settings/branches-tab";
import { HolidaysTab } from "@/components/admin/settings/holidays-tab";
import { getSocietyConfig } from "@/actions/settings";
import { AccountSeriesTab } from "@/components/admin/settings/account-series-tab";

export default async function SettingsPage() {
  const config = await getSocietyConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings & Compliance</h1>
        <p className="text-muted-foreground">
          Manage society-wide configurations, policies, and compliance settings.
        </p>
      </div>

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="series">Account Series</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="holidays">Holiday Calendar</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <GeneralSettingsTab config={config} />
        </TabsContent>
        <TabsContent value="series">
          <AccountSeriesTab config={config} />
        </TabsContent>
         <TabsContent value="branches">
          <BranchesTab />
        </TabsContent>
         <TabsContent value="holidays">
          <HolidaysTab />
        </TabsContent>
        <TabsContent value="compliance">
          <ComplianceTab config={config} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
