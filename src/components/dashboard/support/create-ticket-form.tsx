
'use client';

import { useRef, useState, useEffect, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from "@/hooks/use-toast";
import { createSupportTicket } from '@/actions/support';
import { TICKET_CATEGORIES } from '@/lib/definitions';
import { Loader2 } from 'lucide-react';

const initialState = {
    success: false,
    error: {
        _form: [] as string[],
        subject: undefined as string[] | undefined,
        message: undefined as string[] | undefined,
    },
};

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Ticket
        </Button>
    )
}

export function CreateTicketForm() {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(createSupportTicket, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Ticket Submitted",
        description: "Our team will get back to you shortly.",
      });
      formRef.current?.reset();
    } else if (state.error?._form?.length) {
       toast({
        variant: "destructive",
        title: "Submission Failed",
        description: state.error._form.join(', '),
      });
    }
  }, [state, toast]);

  return (
    <form ref={formRef} action={formAction}>
      <Card>
        <CardHeader>
          <CardTitle>Create a New Support Ticket</CardTitle>
          <CardDescription>Describe your issue, and our team will assist you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select name="category" required>
                    <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                        {TICKET_CATEGORIES.map(cat => (
                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" name="subject" required />
                {state.error?.subject && <p className="text-sm text-destructive">{state.error.subject.join(', ')}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required className="min-h-[150px]" />
                {state.error?.message && <p className="text-sm text-destructive">{state.error.message.join(', ')}</p>}
            </div>
        </CardContent>
        <CardFooter>
          <SubmitButton />
        </CardFooter>
      </Card>
    </form>
  );
}
