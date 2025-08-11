

'use client';

import { useTransition } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { updateSocietyConfig } from '@/actions/settings';
import type { SocietyConfig } from '@/lib/definitions';
import { Separator } from '@/components/ui/separator';

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Settings
        </Button>
    )
}

export function GeneralSettingsTab({ config }: { config: SocietyConfig }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  
  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
        const result = await updateSocietyConfig(null, formData);
        if (result.success) {
            toast({ title: 'Settings Saved', description: 'Society configuration has been updated.' });
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    });
  }

  return (
    <Card>
      <form action={handleFormAction}>
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
          <Separator />
           <div>
                <h3 className="text-md font-medium">Member ID Series</h3>
                 <p className="text-sm text-muted-foreground mb-2">Configure the prefix and next number for auto-generated Member IDs.</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="space-y-2">
                        <Label htmlFor="memberIdPrefix">Prefix</Label>
                        <Input id="memberIdPrefix" name="memberIdPrefix" defaultValue={config.memberIdPrefix} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="memberIdNextNumber">Next Number</Label>
                        <Input id="memberIdNextNumber" name="memberIdNextNumber" type="number" defaultValue={config.memberIdNextNumber} />
                    </div>
                </div>
            </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton isPending={isPending} />
        </CardFooter>
      </form>
    </Card>
  );
}
