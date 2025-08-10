
import { getAvailableDepositProducts } from "@/actions/deposits";
import { ApplyForDepositForm } from "@/components/dashboard/apply-deposit-form";
import { UserNav } from "@/components/user-nav";
import { getSession } from "@/lib/auth";

export default async function ApplyForDepositPage() {
    const products = await getAvailableDepositProducts();
    const session = await getSession();

    return (
      <>
        <header className="flex items-center justify-between py-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Apply for a Deposit</h1>
                <p className="text-muted-foreground">Choose a product and start your investment.</p>
            </div>
            <div className="flex items-center gap-4">
                <UserNav />
            </div>
        </header>

        <ApplyForDepositForm products={products} />
      </>
    );
}
