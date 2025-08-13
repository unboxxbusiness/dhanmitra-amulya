

import { MemberGrowthChart } from "@/components/admin/analytics/member-growth-chart";
import { LoanDepositChart } from "@/components/admin/analytics/loan-deposit-chart";
import { TransactionVolumeChart } from "@/components/admin/analytics/transaction-volume-chart";

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-muted-foreground">
          Visualize your cooperative's growth and financial trends over time.
        </p>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <MemberGrowthChart />
        <LoanDepositChart />
      </div>
       <div className="grid gap-6">
          <TransactionVolumeChart />
       </div>
    </div>
  );
}
