
import { getAvailableLoanProducts } from "@/actions/loans";
import { ApplyForLoanForm } from "@/components/dashboard/apply-loan-form";
import { UserNav } from "@/components/user-nav";
import { getSession } from "@/lib/auth";

export default async function ApplyForLoanPage() {
    const products = await getAvailableLoanProducts();
    const session = await getSession();

    return (
      <>
        <header className="flex items-center justify-between py-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
                <p className="text-muted-foreground">Fill out the form below to apply for a loan.</p>
            </div>
            <div className="flex items-center gap-4">
                <UserNav />
            </div>
        </header>

        <ApplyForLoanForm products={products} />
      </>
    );
}
