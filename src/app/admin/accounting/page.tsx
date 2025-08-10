
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartOfAccountsTab } from "@/components/admin/accounting/chart-of-accounts-tab";
import { JournalEntriesTab } from "@/components/admin/accounting/journal-entries-tab";
import { TrialBalanceTab } from "@/components/admin/accounting/trial-balance-tab";

export default function AccountingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Accounting & General Ledger</h1>
        <p className="text-muted-foreground">
          View accounts, journal entries, and financial reports.
        </p>
      </div>

      <Tabs defaultValue="journal" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="journal">Journal Entries</TabsTrigger>
          <TabsTrigger value="coa">Chart of Accounts</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="journal">
          <JournalEntriesTab />
        </TabsContent>
        <TabsContent value="coa">
            <ChartOfAccountsTab />
        </TabsContent>
        <TabsContent value="trial-balance">
            <TrialBalanceTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
