
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { type DepositProduct, TermSchema } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { applyForDeposit } from '@/actions/deposits';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const FormSchema = z.object({
  productId: z.string().min(1, 'Please select a product.'),
  principalAmount: z.coerce.number().positive('Deposit amount must be positive.'),
  term: TermSchema,
});

type FormValues = z.infer<typeof FormSchema>;

export function ApplyForDepositForm({ products }: { products: DepositProduct[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<DepositProduct | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
  });

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId) || null;
    setSelectedProduct(product);
    form.setValue('productId', productId);
    form.resetField('term'); // Reset term when product changes
  };

  const handleTermChange = (termString: string) => {
    const term = JSON.parse(termString);
    form.setValue('term', term);
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result = await applyForDeposit(data);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Application Submitted",
        description: "Your deposit application has been received and is pending review.",
      });
      router.push('/dashboard');
    } else {
      toast({
        variant: "destructive",
        title: "Application Failed",
        description: result.error,
      });
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Deposit Application Form</CardTitle>
          <CardDescription>All applications are subject to review and approval.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Deposit Product</Label>
            <Select onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a product..." />
              </SelectTrigger>
              <SelectContent>
                {products.map(p => (
                  <SelectItem key={p.id!} value={p.id!}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
             {form.formState.errors.productId && <p className="text-red-500 text-sm">{form.formState.errors.productId.message}</p>}
          </div>

          {selectedProduct && (
            <>
              <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
              <div className="space-y-2">
                <Label htmlFor="principalAmount">Deposit Amount (₹)</Label>
                <Input
                  id="principalAmount"
                  type="number"
                  {...form.register('principalAmount')}
                  min={selectedProduct.minDeposit}
                  max={selectedProduct.maxDeposit}
                />
                <p className="text-xs text-muted-foreground">
                  Min: ₹{selectedProduct.minDeposit}, Max: ₹{selectedProduct.maxDeposit}
                </p>
                {form.formState.errors.principalAmount && <p className="text-red-500 text-sm">{form.formState.errors.principalAmount.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Select Term</Label>
                <RadioGroup onValueChange={handleTermChange} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedProduct.terms.map(term => (
                     <div className="flex items-center space-x-2 rounded-md border p-4" key={`${term.durationMonths}-${term.interestRate}`}>
                        <RadioGroupItem value={JSON.stringify(term)} id={`term-${term.durationMonths}`} />
                        <Label htmlFor={`term-${term.durationMonths}`} className="font-normal w-full">
                            {term.durationMonths} months at {term.interestRate.toFixed(2)}% interest
                        </Label>
                    </div>
                  ))}
                </RadioGroup>
                {form.formState.errors.term && <p className="text-red-500 text-sm">Please select a term.</p>}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!selectedProduct || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
