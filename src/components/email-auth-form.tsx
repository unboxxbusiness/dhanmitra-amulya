'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { Loader2 } from 'lucide-react';

import { auth } from '@/lib/firebase/client';
import { createSession } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { ROLES, Role } from '@/lib/definitions';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

type UserFormValue = z.infer<typeof formSchema>;

interface EmailAuthFormProps {
  mode: 'login' | 'signup';
}

export function EmailAuthForm({ mode }: EmailAuthFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const defaultValues = { email: '', password: '' };

  const form = useForm<UserFormValue>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const onSubmit = async (data: UserFormValue) => {
    setLoading(true);
    try {
      const authFn = mode === 'login' ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
      const userCredential = await authFn(auth, data.email, data.password);
      const idToken = await userCredential.user.getIdToken();
      
      const sessionResult = await createSession(idToken);
      if (sessionResult.success) {
        toast({
          title: mode === 'login' ? "Login Successful" : "Account Created",
          description: "Redirecting...",
        });
        // Instead of client-side push, refresh the page and let the middleware handle redirection.
        router.refresh();
      } else {
        throw new Error(sessionResult.error || 'Session creation failed');
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Authentication Failed',
        description: error.message || 'An unexpected error occurred.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="name@example.com" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" disabled={loading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={loading} className="w-full" type="submit">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {mode === 'login' ? 'Sign In' : 'Sign Up'}
        </Button>
      </form>
    </Form>
  );
}
