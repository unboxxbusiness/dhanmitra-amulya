
'use client';

import { useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateSocietyConfig } from '@/actions/settings';
import type { SocietyConfig } from '@/lib/definitions';

const initialState = { success: false, error: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
        </Button>
    )
}

export function GeneralSettingsTab({ config }: { config: SocietyConfig }) {
  const { toast } = useToast();
  const [state, formAction] = useActionState(updateSocietyConfig, initialState);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Settings Saved', description: 'Society configuration has been updated.' });
      state.success = false;
    } else if (state.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
      state.error = null;
    }
  }, [state, toast]);

  return (
    <Card>
      <form action={formAction}>
        <CardHeader>
          <CardTitle>Society Configuration</CardTitle>
          <CardDescription>
            Basic information about your cooperative society.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="societyName">Society Name</Label>
            <Input id="societyName" name="societyName" defaultValue={config.name} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input id="registrationNumber" name="registrationNumber" defaultValue={config.registrationNumber} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" name="address" defaultValue={config.address} />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
