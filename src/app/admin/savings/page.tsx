
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SavingsAccountsTab } from "@/components/admin/savings/savings-accounts-tab";
import { SavingsSchemesTab } from "@/components/admin/savings/savings-schemes-tab";
import { SavingsSettingsTab } from "@/components/admin/savings/savings-settings-tab";

export default function SavingsManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Savings Management</h1>
        <p className="text-muted-foreground">
          Create and manage member savings accounts and schemes.
        </p>
      </div>

      <Tabs defaultValue="accounts" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="schemes">Schemes</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="accounts">
          <SavingsAccountsTab />
        </TabsContent>
        <TabsContent value="schemes">
          <SavingsSchemesTab />
        </TabsContent>
        <TabsContent value="settings">
          <SavingsSettingsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
