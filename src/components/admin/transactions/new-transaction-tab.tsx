

'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Loader2, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { createTransaction } from '@/actions/transactions';
import type { Transaction } from '@/lib/definitions';
import { getSavingsAccounts, type SavingsAccount } from '@/actions/savings';
import { ReceiptDialog } from './receipt-dialog';
import { Combobox } from '@/components/ui/combobox';
import type { UserProfile } from '@/lib/definitions';
import { getAllMembers } from '@/actions/users';

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending} className="w-full">
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Transaction
        </Button>
    )
}

export function NewTransactionTab() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [isPending, startTransition] = useTransition();
    
    const [members, setMembers] = useState<UserProfile[]>([]);
    const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMemberId, setSelectedMemberId] = useState<string>('');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const [isReceiptOpen, setReceiptOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<Transaction | null>(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [fetchedMembers, fetchedAccounts] = await Promise.all([
                    getAllMembers(),
                    getSavingsAccounts()
                ]);
                setMembers(fetchedMembers.filter(m => m.status === 'Active'));
                setAccounts(fetchedAccounts.filter(acc => acc.status === 'Active'));
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load accounts.' });
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [toast]);
    
    const handleFormAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await createTransaction(null, formData);
            if (result.success && result.transaction) {
                toast({ title: "Transaction Successful", description: `The transaction was processed successfully.` });
                setReceiptData(result.transaction);
                setReceiptOpen(true);
                formRef.current?.reset();
                setSelectedMemberId('');
                setSelectedAccountId('');
            } else if (result.error) {
                toast({
                    variant: 'destructive',
                    title: "Transaction Failed",
                    description: result.error,
                });
            }
        });
    }

    const memberOptions = members.map(member => ({
        value: member.id,
        label: `${member.name} - ${member.memberId}`
    }));

    const memberAccounts = accounts.filter(acc => acc.userId === selectedMemberId);
    const accountOptions = memberAccounts.map(account => ({
        value: account.id,
        label: `${account.schemeName} (...${account.id.slice(-4)}) - Bal: ₹${account.balance}`
    }));

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

    return (
      <>
        <Card className="max-w-2xl mx-auto">
            <form ref={formRef} action={handleFormAction}>
                <input type="hidden" name="savingsAccountId" value={selectedAccountId} />
                <CardHeader>
                    <CardTitle>New Manual Transaction</CardTitle>
                    <CardDescription>
                        Record a deposit (credit) or withdrawal (debit) for a member's savings account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="memberId">Select Member</Label>
                        {loading ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading members...</span>
                            </div>
                        ) : (
                            <Combobox
                                options={memberOptions}
                                value={selectedMemberId}
                                onChange={(value) => {
                                    setSelectedMemberId(value);
                                    setSelectedAccountId(''); // Reset account selection
                                }}
                                placeholder="Search by name or member ID..."
                                emptyPlaceholder="No member found."
                            />
                        )}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="accountId">Select Savings Account</Label>
                        <Combobox
                            options={accountOptions}
                            value={selectedAccountId}
                            onChange={setSelectedAccountId}
                            placeholder="Select a savings account..."
                            emptyPlaceholder="No savings account found for this member."
                            className={!selectedMemberId ? "disabled:cursor-not-allowed disabled:opacity-50" : ""}
                        />
                    </div>

                    {selectedAccount && (
                         <div className="p-3 bg-muted rounded-md text-sm">
                            <p><b>Current Balance:</b> <span className="font-mono">₹{selectedAccount.balance.toFixed(2)}</span></p>
                        </div>
                    )}
                    
                    <div className="space-y-2">
                        <Label>Transaction Type</Label>
                        <RadioGroup name="type" defaultValue="credit" className="flex gap-4" required>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="credit" id="credit" />
                                <Label htmlFor="credit">Credit (Deposit)</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="debit" id="debit" />
                                <Label htmlFor="debit">Debit (Withdrawal)</Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Amount</Label>
                            <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description / Notes</Label>
                            <Input id="description" name="description" placeholder="e.g., Cash Deposit" required />
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <SubmitButton isPending={isPending} />
                </CardFooter>
            </form>
        </Card>
        {receiptData && (
            <ReceiptDialog 
                isOpen={isReceiptOpen}
                onClose={() => setReceiptOpen(false)}
                transaction={receiptData}
            />
        )}
      </>
    );
}

    
