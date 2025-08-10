
'use client';

import { useEffect, useActionState, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Link } from "lucide-react";
import { updateUpiLink } from '@/actions/settings';
import type { SocietyConfig } from '@/lib/definitions';

const initialState = { success: false, error: null, message: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Link
        </Button>
    )
}

export function UpiPaymentTab({ config }: { config: SocietyConfig }) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(updateUpiLink, initialState);

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
          <CardTitle>UPI Payment Link</CardTitle>
          <CardDescription>
            Provide a universal UPI link (e.g., upi://pay?pa=... or a URL to a QR code) for members to use.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="upiLink">UPI Payment Link / URL</Label>
            <div className="flex items-center space-x-2">
                <Link className="h-5 w-5 text-muted-foreground" />
                <Input 
                    id="upiLink" 
                    name="upiLink" 
                    defaultValue={config.upiPaymentLink} 
                    placeholder="upi://pay?pa=your-vpa@okhdfcbank&pn=YourName"
                />
            </div>
          </div>
           <p className="text-sm text-muted-foreground">
                This link will be shown to all members on their dashboard as a quick payment option.
            </p>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <SubmitButton />
        </CardFooter>
      </form>
    </Card>
  );
}
