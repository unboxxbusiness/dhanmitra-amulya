
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { NewTransactionTab } from "@/components/admin/transactions/new-transaction-tab";
import { TransactionHistoryTab } from "@/components/admin/transactions/transaction-history-tab";
import { BankReconciliationTab } from "@/components/admin/transactions/bank-reconciliation-tab";

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions & Teller Operations</h1>
        <p className="text-muted-foreground">
          Record member transactions, view history, and manage reconciliation.
        </p>
      </div>

      <Tabs defaultValue="new-transaction" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="new-transaction">New Transaction</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
          <TabsTrigger value="reconciliation">Bank Reconciliation</TabsTrigger>
        </TabsList>
        <TabsContent value="new-transaction">
          <NewTransactionTab />
        </TabsContent>
        <TabsContent value="history">
          <TransactionHistoryTab />
        </TabsContent>
        <TabsContent value="reconciliation">
          <BankReconciliationTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
