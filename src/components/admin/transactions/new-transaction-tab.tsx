
'use client';

import { useState, useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, Receipt } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from '@/hooks/use-toast';
import { createTransaction, type Transaction } from '@/actions/transactions';
import { getSavingsAccounts, type SavingsAccount } from '@/actions/savings';
import { ReceiptDialog } from './receipt-dialog';
import { Combobox } from '@/components/ui/combobox';

const initialState = {
  success: false,
  error: null,
  transaction: null as Transaction | null,
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="w-full">
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Transaction
        </Button>
    )
}

export function NewTransactionTab() {
    const { toast } = useToast();
    const formRef = useRef<HTMLFormElement>(null);
    const [state, formAction] = useActionState(createTransaction, initialState);
    
    const [accounts, setAccounts] = useState<SavingsAccount[]>([]);
    const [loadingAccounts, setLoadingAccounts] = useState(true);
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');

    const [isReceiptOpen, setReceiptOpen] = useState(false);
    const [receiptData, setReceiptData] = useState<Transaction | null>(null);

    useEffect(() => {
        async function fetchAccounts() {
            setLoadingAccounts(true);
            try {
                const fetchedAccounts = await getSavingsAccounts();
                setAccounts(fetchedAccounts.filter(acc => acc.status === 'Active'));
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load savings accounts.' });
            } finally {
                setLoadingAccounts(false);
            }
        }
        fetchAccounts();
    }, [toast]);
    
    useEffect(() => {
        if (state.success && state.transaction) {
            toast({ title: "Transaction Successful", description: `The transaction was processed successfully.` });
            setReceiptData(state.transaction);
            setReceiptOpen(true);
            formRef.current?.reset();
            setSelectedAccountId('');
            // Reset state
            state.success = false; 
            state.transaction = null;
        } else if (state.error) {
            toast({
                variant: 'destructive',
                title: "Transaction Failed",
                description: state.error,
            });
            state.error = null;
        }
    }, [state, toast]);

    const accountOptions = accounts.map(account => ({
        value: account.id,
        label: `${account.userName} - ${account.accountNumber}`
    }));

    const selectedAccount = accounts.find(acc => acc.id === selectedAccountId);

    return (
      <>
        <Card className="max-w-2xl mx-auto">
            <form ref={formRef} action={formAction}>
                {/* Hidden input to carry accountId in the form */}
                <input type="hidden" name="accountId" value={selectedAccountId} />
                <CardHeader>
                    <CardTitle>New Manual Transaction</CardTitle>
                    <CardDescription>
                        Record a deposit (credit) or withdrawal (debit) for a member's savings account.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="accountId">Select Member's Account</Label>
                        {loadingAccounts ? (
                            <div className="flex items-center space-x-2">
                                <Loader2 className="h-5 w-5 animate-spin" />
                                <span>Loading accounts...</span>
                            </div>
                        ) : (
                            <Combobox
                                options={accountOptions}
                                value={selectedAccountId}
                                onChange={setSelectedAccountId}
                                placeholder="Search by name or account number..."
                                emptyPlaceholder="No account found."
                            />
                        )}
                    </div>

                    {selectedAccount && (
                         <div className="p-3 bg-muted rounded-md text-sm">
                            <p><b>Selected Account:</b> {selectedAccount.accountNumber}</p>
                            <p><b>Member:</b> {selectedAccount.userName}</p>
                            <p><b>Current Balance:</b> <span className="font-mono">${selectedAccount.balance.toFixed(2)}</span></p>
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
                    <SubmitButton />
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
