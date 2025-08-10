
import { AccountStatementGenerator } from "@/components/dashboard/documents/account-statement-generator";
import { InterestCertificate } from "@/components/dashboard/documents/interest-certificate";
import { LoanClosureCertificate } from "@/components/dashboard/documents/loan-closure-certificate";
import { getMemberFinancials } from "@/actions/users";

export default async function DocumentsPage() {
    const financials = await getMemberFinancials();

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Documents & Statements</h1>
            <p className="text-muted-foreground">Generate and download account statements and certificates.</p>
        </header>

        <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-8">
                <AccountStatementGenerator savingsAccounts={financials.savingsAccounts} />
                <InterestCertificate />
            </div>
            <div>
                <LoanClosureCertificate loans={financials.activeLoans} />
            </div>
        </div>

      </div>
    );
}
