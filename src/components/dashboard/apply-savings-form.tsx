
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
import { type SavingsScheme } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { applyForSavingsAccount } from '@/actions/savings';
import { useRouter } from 'next/navigation';
import { Loader2, Eye, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const FormSchema = z.object({
  schemeId: z.string().min(1, 'Please select a savings scheme.'),
  initialDeposit: z.coerce.number().min(0, 'Initial deposit cannot be negative.'),
});

type FormValues = z.infer<typeof FormSchema>;

function SchemeDetailsDialog({ scheme }: { scheme: SavingsScheme }) {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><Eye className="mr-2 h-4 w-4" />View Details</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{scheme.name}</DialogTitle>
                    <DialogDescription>Interest Rate: {scheme.interestRate.toFixed(2)}% p.a.</DialogDescription>
                </DialogHeader>
                <div className="max-h-[60vh] overflow-y-auto pr-4 my-4">
                    <p className="whitespace-pre-wrap">{scheme.content}</p>
                </div>
                 {scheme.externalLink && (
                    <Button asChild>
                        <a href={scheme.externalLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Learn More
                        </a>
                    </Button>
                )}
            </DialogContent>
        </Dialog>
    )
}

export function ApplyForSavingsForm({ schemes }: { schemes: SavingsScheme[] }) {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedScheme, setSelectedScheme] = useState<SavingsScheme | null>(null);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
        initialDeposit: 0,
    }
  });

  const handleSchemeChange = (schemeId: string) => {
    const scheme = schemes.find(p => p.id === schemeId) || null;
    setSelectedScheme(scheme);
    form.setValue('schemeId', schemeId);
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    const result = await applyForSavingsAccount(data);
    setLoading(false);

    if (result.success) {
      toast({
        title: "Application Submitted",
        description: "Your savings account application has been received and is pending review.",
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
          <CardTitle>Savings Account Application</CardTitle>
          <CardDescription>All applications are subject to review and approval by an administrator.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Select Savings Scheme</Label>
             <div className="flex items-center gap-4">
                <Select onValueChange={handleSchemeChange} required>
                <SelectTrigger>
                    <SelectValue placeholder="Choose a scheme..." />
                </SelectTrigger>
                <SelectContent>
                    {schemes.map(s => (
                    <SelectItem key={s.id!} value={s.id!}>{s.name} ({s.interestRate}% p.a.)</SelectItem>
                    ))}
                </SelectContent>
                </Select>
                {selectedScheme && <SchemeDetailsDialog scheme={selectedScheme} />}
            </div>
             {form.formState.errors.schemeId && <p className="text-red-500 text-sm">{form.formState.errors.schemeId.message}</p>}
          </div>

          {selectedScheme && (
            <>
              <div className="space-y-2">
                <Label htmlFor="initialDeposit">Initial Deposit Amount (₹)</Label>
                <Input
                  id="initialDeposit"
                  type="number"
                  {...form.register('initialDeposit')}
                />
                {form.formState.errors.initialDeposit && <p className="text-sm text-destructive">{form.formState.errors.initialDeposit.message}</p>}
              </div>
            </>
          )}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={!selectedScheme || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Application
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
