

'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { createSavingsAccount, getSavingsSchemes, type SavingsScheme } from '@/actions/savings';
import { getAllMembers, type UserProfile } from '@/actions/users';
import { Loader2 } from 'lucide-react';

interface CreateAccountDialogProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
}

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
        </Button>
    )
}

export function CreateAccountDialog({ isOpen, onClose }: CreateAccountDialogProps) {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [schemes, setSchemes] = useState<SavingsScheme[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        
        async function fetchData() {
            setLoading(true);
            try {
                const [fetchedMembers, fetchedSchemes] = await Promise.all([
                    getAllMembers(),
                    getSavingsSchemes()
                ]);
                setMembers(fetchedMembers.filter(m => m.status === 'Active'));
                setSchemes(fetchedSchemes);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load members or schemes.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [isOpen, toast]);
    
    const handleFormAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createSavingsAccount(null, formData);
            if (result.success) {
                 toast({ title: "Account Created", description: "The new savings account is now active." });
                onClose(true);
            } else {
                toast({
                    variant: 'destructive',
                    title: "Error",
                    description: result.error,
                });
            }
        });
    }

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form ref={formRef} action={handleFormAction}>
                    <DialogHeader>
                        <DialogTitle>Create New Savings Account</DialogTitle>
                        <DialogDescription>
                           Select a member and a savings scheme to open a new account.
                        </DialogDescription>
                    </DialogHeader>
                    {loading ? (
                        <div className="py-4 text-center">
                            <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                            <p className="mt-2">Loading members and schemes...</p>
                        </div>
                    ) : (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="userId" className="text-right">Member</Label>
                                <Select name="userId" required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a member" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {members.map(member => (
                                            <SelectItem key={member.id} value={member.id}>
                                                {member.name} ({member.email})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="schemeId" className="text-right">Scheme</Label>
                                <Select name="schemeId" required>
                                    <SelectTrigger className="col-span-3">
                                        <SelectValue placeholder="Select a scheme" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {schemes.map(scheme => (
                                            <SelectItem key={scheme.id} value={scheme.id}>
                                                {scheme.name} ({scheme.interestRate}%)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="initialDeposit" className="text-right">Initial Deposit</Label>
                                <Input id="initialDeposit" name="initialDeposit" type="number" step="0.01" placeholder="0.00" className="col-span-3" />
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button type="button" variant="secondary" onClick={() => onClose()}>Cancel</Button>
                        </DialogClose>
                        <SubmitButton isPending={isPending} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
