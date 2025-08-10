

'use client';

import { useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateAccountNumberSeries } from '@/actions/settings';
import type { SocietyConfig } from '@/lib/definitions';
import { Separator } from '@/components/ui/separator';

const initialState = { success: false, error: null, message: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Series
        </Button>
    )
}

export function AccountSeriesTab({ config }: { config: SocietyConfig }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(updateAccountNumberSeries, initialState);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Success', description: state.message });
      state.success = false;
      state.message = null;
    } else if (state.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
      state.error = null;
    }
  }, [state, toast]);

  return (
    <Card>
      <form ref={formRef} action={formAction}>
        <CardHeader>
          <CardTitle>Account Number Series</CardTitle>
          <CardDescription>
            Configure the prefixes and next numbers for auto-generated account numbers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            {/* Savings Accounts */}
            <div>
                <h3 className="text-md font-medium">Savings Accounts</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="savingsPrefix">Prefix</Label>
                        <Input id="savingsPrefix" name="savingsPrefix" defaultValue={config.savingsPrefix} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="savingsNextNumber">Next Number</Label>
                        <Input id="savingsNextNumber" name="savingsNextNumber" type="number" defaultValue={config.savingsNextNumber} />
                    </div>
                </div>
            </div>
            
            <Separator />

            {/* Loan Accounts */}
             <div>
                <h3 className="text-md font-medium">Loan Accounts</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="loanPrefix">Prefix</Label>
                        <Input id="loanPrefix" name="loanPrefix" defaultValue={config.loanPrefix} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="loanNextNumber">Next Number</Label>
                        <Input id="loanNextNumber" name="loanNextNumber" type="number" defaultValue={config.loanNextNumber} />
                    </div>
                </div>
            </div>

            <Separator />
            
            {/* Deposit Accounts */}
            <div>
                <h3 className="text-md font-medium">Deposit Accounts</h3>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="depositPrefix">Prefix</Label>
                        <Input id="depositPrefix" name="depositPrefix" defaultValue={config.depositPrefix} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="depositNextNumber">Next Number</Label>
                        <Input id="depositNextNumber" name="depositNextNumber" type="number" defaultValue={config.depositNextNumber} />
                    </div>
                </div>
            </div>

             <p className="text-sm text-muted-foreground pt-4">
                The 'Next Number' will be used for the next account created and then automatically incremented.
            </p>

        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
