
'use client';

import { useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSavingsSettings, updateSavingsSettings, type SavingsSettings } from '@/actions/savings';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
        </Button>
    )
}

const initialState = { success: false, error: null };

export function SavingsSettingsTab() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SavingsSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, formAction] = useActionState(updateSavingsSettings, initialState);

  useEffect(() => {
    getSavingsSettings()
        .then(setSettings)
        .catch(err => {
            toast({ variant: 'destructive', title: 'Error', description: err.message });
        })
        .finally(() => setLoading(false));
  }, [toast]);

  useEffect(() => {
    if (state.success) {
      toast({ title: "Settings Saved", description: "Global savings settings have been updated." });
    } else if (state.error) {
      toast({ variant: 'destructive', title: "Error", description: state.error });
    }
  }, [state, toast]);

  if (loading) {
    return (
        <Card>
            <CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader>
            <CardContent className="space-y-8">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Global Savings Settings</CardTitle>
            <CardDescription>
                These settings apply to all savings accounts unless overridden by a specific scheme.
            </CardDescription>
        </CardHeader>
        <form action={formAction}>
            <CardContent className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="interestCalculationPeriod">Interest Calculation Period</Label>
                    <Select name="interestCalculationPeriod" defaultValue={settings?.interestCalculationPeriod}>
                        <SelectTrigger id="interestCalculationPeriod">
                            <SelectValue placeholder="Select period" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="quarterly">Quarterly</SelectItem>
                            <SelectItem value="annually">Annually</SelectItem>
                        </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Determines how frequently interest is compounded.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="latePaymentPenaltyRate">Late Payment Penalty Rate (%)</Label>
                    <Input 
                        id="latePaymentPenaltyRate" 
                        name="latePaymentPenaltyRate" 
                        type="number" 
                        step="0.01" 
                        defaultValue={settings?.latePaymentPenaltyRate}
                        placeholder="e.g. 1.5"
                    />
                    <p className="text-sm text-muted-foreground">The penalty rate applied to overdue loan payments.</p>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="accountMaintenanceFee">Account Maintenance Fee ($)</Label>
                    <Input 
                        id="accountMaintenanceFee" 
                        name="accountMaintenanceFee" 
                        type="number" 
                        step="0.01"
                        defaultValue={settings?.accountMaintenanceFee}
                        placeholder="e.g. 5.00"
                    />
                     <p className="text-sm text-muted-foreground">A flat fee charged periodically for account maintenance, if any.</p>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <SubmitButton />
            </CardFooter>
        </form>
    </Card>
  );
}
