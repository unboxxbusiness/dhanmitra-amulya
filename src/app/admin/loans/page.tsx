
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoanProductsTab } from "@/components/admin/loans/loan-products-tab";
import { LoanApplicationsTab } from "@/components/admin/loans/loan-applications-tab";
import { ActiveLoansTab } from "@/components/admin/loans/active-loans-tab";
import { RepaymentsTab } from "@/components/admin/loans/repayments-tab";

export default function LoanManagementPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Loan Management</h1>
        <p className="text-muted-foreground">
          Manage loan products, applications, and repayments.
        </p>
      </div>

      <Tabs defaultValue="applications" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="active-loans">Active Loans</TabsTrigger>
          <TabsTrigger value="repayments">Repayments</TabsTrigger>
        </TabsList>
        <TabsContent value="products">
          <LoanProductsTab />
        </TabsContent>
        <TabsContent value="applications">
          <LoanApplicationsTab />
        </TabsContent>
        <TabsContent value="active-loans">
          <ActiveLoansTab />
        </TabsContent>
         <TabsContent value="repayments">
          <RepaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
