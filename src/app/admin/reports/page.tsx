
import { MemberListReport } from "@/components/admin/reports/member-list-report";
import { TrialBalanceReport } from "@/components/admin/reports/trial-balance-report";
import { SavingsAccountReport } from "@/components/admin/reports/savings-account-report";
import { LoanAgingReport } from "@/components/admin/reports/loan-aging-report";
import { ProfitLossReport } from "@/components/admin/reports/profit-loss-report";
import { BalanceSheetReport } from "@/components/admin/reports/balance-sheet-report";

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
        {/* Core Reports */}
        <MemberListReport />
        <SavingsAccountReport />
        <LoanAgingReport />
        
        {/* Financial Statements */}
        <TrialBalanceReport />
        <ProfitLossReport />
        <BalanceSheetReport />
      </div>
    </div>
  );
}
