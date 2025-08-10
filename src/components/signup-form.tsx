
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { submitApplication } from '@/actions/users';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Separator } from './ui/separator';

const formSchema = z.object({
  name: z.string().min(2, { message: 'Please enter your full name.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  phone: z.string().min(10, { message: 'Please enter a valid 10-digit mobile number.' }),
});

type UserFormValue = z.infer<typeof formSchema>;

export function SignupForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
    },
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      // Step 1: Submit the application to Firestore via server action
      const applicationData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        // @ts-ignore
        kycDocs: {
          id: '',
          photo: '',
          addressProof: '',
        }
      };
      
      const result = await submitApplication(applicationData);

      if (result.success) {
        setStep(2); // Move to success step
      } else {
        throw new Error(result.error || 'Failed to submit application.');
      }

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Sign Up Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };
  
  if (step === 2) {
    return (
        <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Application Submitted!</h2>
            <p className="text-muted-foreground mb-6">Thank you. Your application is now under review. We will notify you via email once it has been processed. You may now close this window.</p>
        </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
             <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="Your legal name" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="name@example.com" disabled={loading} {...field} />
                </FormControl>
                 <FormDescription>
                    You will receive an email with a temporary password once your application is approved.
                </FormDescription>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Mobile Number</FormLabel>
                    <FormControl>
                        <Input type="tel" placeholder="Your mobile number" disabled={loading} {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
        </div>

        <Button disabled={loading} className="w-full" type="submit">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Submit Application
        </Button>
      </form>
    </Form>
  );
}
