
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MemberListReport } from "@/components/admin/reports/member-list-report";
import { TrialBalanceReport } from "@/components/admin/reports/trial-balance-report";
import { SavingsAccountReport } from "@/components/admin/reports/savings-account-report";
import { LoanAgingReport } from "@/components/admin/reports/loan-aging-report";
import { PlaceholderReport } from "@/components/admin/reports/placeholder-report";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Reports & Exports</h1>
        <p className="text-muted-foreground">
          Generate and export financial and operational reports.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <MemberListReport />
        <SavingsAccountReport />
        <TrialBalanceReport />
        <LoanAgingReport />

        {/* Placeholder Reports */}
        <PlaceholderReport 
          title="Profit & Loss Statement"
          description="A summary of revenues, costs, and expenses during a specific period."
        />
        <PlaceholderReport 
          title="Balance Sheet"
          description="A snapshot of the company's assets, liabilities, and shareholders' equity."
        />
         <PlaceholderReport 
          title="Cash Flow Statement"
          description="Shows how cash has moved into and out of the company."
        />

      </div>
    </div>
  );
}
