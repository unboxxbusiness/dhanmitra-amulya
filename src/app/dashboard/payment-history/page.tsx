
import { getSession } from "@/lib/auth";
import { getMemberLoanHistory } from "@/actions/loans";
import { PaymentHistoryClient } from "@/components/dashboard/payment-history-client";

export default async function PaymentHistoryPage() {
    const session = await getSession();
    if (!session) {
        // This should be handled by middleware, but as a safeguard:
        return null;
    }

    const history = await getMemberLoanHistory(session);

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Loan Payment History</h1>
            <p className="text-muted-foreground">A complete record of all your loan repayments.</p>
        </header>

        <PaymentHistoryClient history={history} />
      </div>
    );
}
