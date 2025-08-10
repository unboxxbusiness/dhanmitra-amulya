
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BankReconciliationTab } from "@/components/admin/integrations/bank-reconciliation-tab"
import { PaymentGatewayTab } from "@/components/admin/integrations/payment-gateway-tab"

export default function IntegrationsPage() {
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
          <TabsTrigger value="payment-gateway">Payment Gateway</TabsTrigger>
        </TabsList>
        <TabsContent value="reconciliation">
          <BankReconciliationTab />
        </TabsContent>
        <TabsContent value="payment-gateway">
          <PaymentGatewayTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
