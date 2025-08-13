

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
import { Slider } from "@/components/ui/slider";
import { type LoanProduct } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { applyForLoan } from '@/actions/loans';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';

const LoanApplicationSchema = z.object({
  productId: z.string().min(1, 'Please select a loan product.'),
  amountRequested: z.coerce.number().positive('Loan amount must be positive.'),
  termMonths: z.coerce.number().int().positive('Loan term must be positive.'),
});

type FormValues = z.infer<typeof LoanApplicationSchema>;

export function ApplyForLoanForm({ products }: { products: LoanProduct[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedProduct, setSelectedProduct] = useState<LoanProduct | null>(null);
  const [loading, setLoading] = useState(false);
  const [term, setTerm] = useState(12);

  const form = useForm<FormValues>({
    resolver: zodResolver(LoanApplicationSchema),
    defaultValues: {
      termMonths: 12,
      productId: '',
      amountRequested: 0,
    },
  });

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId) || null;
    setSelectedProduct(product);
    form.setValue('productId', productId);
    setTerm(12);
    form.setValue('termMonths', 12);
  };
  
  const handleTermChange = (value: number[]) => {
      setTerm(value[0]);
      form.setValue('termMonths', value[0]);
  }

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result = await applyForLoan(data);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Application Submitted",
        description: "Your loan application has been received and is pending review.",
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Loan Application Form</CardTitle>
            <CardDescription>All applications are subject to review and approval.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select Loan Product</FormLabel>
                   <Select onValueChange={(value) => {
                      field.onChange(value);
                      handleProductChange(value);
                   }} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a loan product..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id!}>{p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedProduct && (
              <>
                <p className="text-sm text-muted-foreground">{selectedProduct.collateralNotes}</p>
                <FormField
                  control={form.control}
                  name="amountRequested"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Amount (₹)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} onChange={(e) => field.onChange(e.target.valueAsNumber || 0)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="termMonths"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Loan Term (Months)</FormLabel>
                       <div className="flex flex-col md:flex-row items-center gap-4">
                          <FormControl>
                             <Slider
                                id="termMonths"
                                min={1}
                                max={selectedProduct.maxTermMonths}
                                step={1}
                                value={[term]}
                                onValueChange={handleTermChange}
                                className="flex-1"
                            />
                          </FormControl>
                          <span className="font-bold w-12 text-center">{term}</span>
                       </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
    </Form>
  );
}
