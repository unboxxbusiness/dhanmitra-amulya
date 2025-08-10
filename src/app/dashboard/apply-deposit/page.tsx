
"use client";

import { getAvailableDepositProducts } from "@/actions/deposits";
import { ApplyForDepositForm } from "@/components/dashboard/apply-deposit-form";
import { useEffect, useState } from "react";

export default function ApplyForDepositPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAvailableDepositProducts().then((data) => {
            setProducts(data);
            setLoading(false);
        });
    }, []);

    return (
      <div className="space-y-6">
        <header>
            <h1 className="text-3xl font-bold tracking-tight">Apply for a Deposit</h1>
            <p className="text-muted-foreground">Choose a product and start your investment.</p>
 </header>
 {loading ? <div>Loading products...</div> : <ApplyForDepositForm products={products} />}
      </div>
    );
}
