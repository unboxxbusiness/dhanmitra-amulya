
import { getAvailableLoanProducts } from "@/actions/loans";
import { ApplyForLoanForm } from "@/components/dashboard/apply-loan-form";

export default async function ApplyForLoanPage() {
    const products = await getAvailableLoanProducts();

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Apply for a Loan</h1>
            <p className="text-muted-foreground">Fill out the form below to apply for a loan.</p>
        </header>

        <ApplyForLoanForm products={products} />
      </div>
    );
}
