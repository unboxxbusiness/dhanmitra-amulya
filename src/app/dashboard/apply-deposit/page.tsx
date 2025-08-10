
import { getAvailableDepositProducts } from "@/actions/deposits";
import { ApplyForDepositForm } from "@/components/dashboard/apply-deposit-form";

export default async function ApplyForDepositPage() {
    const products = await getAvailableDepositProducts();

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Apply for a Deposit</h1>
            <p className="text-muted-foreground">Choose a product and start your investment.</p>
        </header>

        <ApplyForDepositForm products={products} />
      </div>
    );
}
