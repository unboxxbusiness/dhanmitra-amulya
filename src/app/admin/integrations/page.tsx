
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankReconciliationTab } from "@/components/admin/integrations/bank-reconciliation-tab"
import { UpiPaymentTab } from "@/components/admin/integrations/upi-payment-tab"
import { getSocietyConfig } from "@/actions/settings";

export default async function IntegrationsPage() {
  const config = await getSocietyConfig();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect to external services like payment gateways and manage data reconciliation.
        </p>
      </div>

      <Tabs defaultValue="reconciliation" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
          <TabsTrigger value="upi-payment">UPI Payment Link</TabsTrigger>
        </TabsList>
        <TabsContent value="reconciliation">
          <BankReconciliationTab />
        </TabsContent>
        <TabsContent value="upi-payment">
          <UpiPaymentTab config={config} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
