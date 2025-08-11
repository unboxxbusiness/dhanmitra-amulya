

'use client';

import { useRef, useTransition } from 'react';
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

function SubmitButton({ pending }: { pending: boolean }) {
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
  const [isPending, startTransition] = useTransition();

  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
        const result = await createSupportTicket(null, formData);
        if (result.success) {
            toast({
                title: "Ticket Submitted",
                description: "Our team will get back to you shortly.",
            });
            formRef.current?.reset();
        } else if (result.error?._form?.length) {
            toast({
                variant: "destructive",
                title: "Submission Failed",
                description: result.error._form.join(', '),
            });
        }
    });
  };

  return (
    <form ref={formRef} action={handleFormAction}>
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
            </div>
             <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" name="message" required className="min-h-[150px]" />
            </div>
        </CardContent>
        <CardFooter>
          <SubmitButton pending={isPending} />
        </CardFooter>
      </Card>
    </form>
  );
}
