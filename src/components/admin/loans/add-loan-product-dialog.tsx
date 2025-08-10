
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addLoanProduct } from '@/actions/loans';
import { LoanProductSchema, type LoanProduct } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AddLoanProductDialogProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

export function AddLoanProductDialog({ isOpen, onClose }: AddLoanProductDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<LoanProduct>({
        resolver: zodResolver(LoanProductSchema),
        defaultValues: {
            name: '',
            interestType: 'flat',
            interestRate: 12,
            maxTermMonths: 60,
            collateralNotes: '',
        },
    });

    const handleSubmit = async (data: LoanProduct) => {
        setLoading(true);
        const result = await addLoanProduct(data);
        if (result.success) {
            toast({ title: "Product Added", description: "The new loan product has been created." });
            onClose(true);
        } else {
            toast({
                variant: 'destructive',
                title: "Error",
                description: result.error || "An unknown error occurred.",
            });
        }
        setLoading(false);
    };
    
    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add New Loan Product</DialogTitle>
                            <DialogDescription>
                                Define a new loan product for members.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                           <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Personal Loan" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="interestType"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Interest Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select interest type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="flat">Flat Rate</SelectItem>
                                                <SelectItem value="reducing_balance">Reducing Balance</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="interestRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Annual Interest Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="maxTermMonths"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Maximum Term (Months)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="collateralNotes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Collateral Notes</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe collateral requirements..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="mt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="secondary" onClick={() => onClose()}>Cancel</Button>
                            </DialogClose>
                            <Button type="submit" disabled={loading}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Product
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
