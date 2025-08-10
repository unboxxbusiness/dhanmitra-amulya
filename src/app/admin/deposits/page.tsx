
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DepositProductsTab } from "@/components/admin/deposits/deposit-products-tab";
import { DepositApplicationsTab } from "@/components/admin/deposits/deposit-applications-tab";
import { ActiveDepositsTab } from "@/components/admin/deposits/active-deposits-tab";

export default function DepositManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Deposit Management</h1>
        <p className="text-muted-foreground">
          Manage Fixed Deposit (FD) and Recurring Deposit (RD) products and applications.
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="active-deposits">Active Deposits</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <DepositProductsTab />
        </TabsContent>
        <TabsContent value="applications">
            <DepositApplicationsTab />
        </TabsContent>
        <TabsContent value="active-deposits">
            <ActiveDepositsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
