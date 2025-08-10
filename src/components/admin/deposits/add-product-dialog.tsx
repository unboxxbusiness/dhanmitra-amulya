
'use client';

import { useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { addDepositProduct, DepositProductSchema, type DepositProduct } from '@/actions/deposits';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface AddProductDialogProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

export function AddProductDialog({ isOpen, onClose }: AddProductDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const form = useForm<DepositProduct>({
        resolver: zodResolver(DepositProductSchema),
        defaultValues: {
            name: '',
            type: 'FD',
            description: '',
            minDeposit: 1000,
            maxDeposit: 100000,
            terms: [{ durationMonths: 12, interestRate: 5.5 }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "terms",
    });

    const handleSubmit = async (data: DepositProduct) => {
        setLoading(true);
        const result = await addDepositProduct(data);
        if (result.success) {
            toast({ title: "Product Added", description: "The new deposit product has been created." });
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
            <DialogContent className="sm:max-w-2xl">
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)}>
                        <DialogHeader>
                            <DialogTitle>Add New Deposit Product</DialogTitle>
                            <DialogDescription>
                                Create a new FD or RD product for members to invest in.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                           <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., 5-Year Freedom FD" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Type</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select a product type" />
                                            </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="FD">Fixed Deposit (FD)</SelectItem>
                                                <SelectItem value="RD">Recurring Deposit (RD)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                             <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Describe the product..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="minDeposit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Minimum Deposit</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="maxDeposit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Maximum Deposit</FormLabel>
                                            <FormControl>
                                                <Input type="number" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div>
                                <Label>Terms (Duration & Interest)</Label>
                                <div className="space-y-2 mt-2">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2 p-2 border rounded-md">
                                        <FormField
                                            control={form.control}
                                            name={`terms.${index}.durationMonths`}
                                            render={({ field: termField }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input type="number" placeholder="Months" {...termField} onChange={e => termField.onChange(parseInt(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <FormField
                                            control={form.control}
                                            name={`terms.${index}.interestRate`}
                                            render={({ field: termField }) => (
                                                <FormItem className="flex-1">
                                                    <FormControl>
                                                        <Input type="number" step="0.01" placeholder="Interest Rate (%)" {...termField} onChange={e => termField.onChange(parseFloat(e.target.value))} />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="mt-2"
                                    onClick={() => append({ durationMonths: 24, interestRate: 6.0 })}
                                >
                                    <PlusCircle className="mr-2 h-4 w-4" />
                                    Add Term
                                </Button>
                            </div>
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
