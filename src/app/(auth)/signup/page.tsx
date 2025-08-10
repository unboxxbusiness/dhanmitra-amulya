import Link from 'next/link';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailAuthForm } from '@/components/email-auth-form';

export default function SignupPage() {
  return (
    <Card className="w-full max-w-md shadow-2xl shadow-primary/10">
      <CardHeader className="text-center space-y-2">
        <CardTitle className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-500">
          Create an Account
        </CardTitle>
        <CardDescription>
          Enter your email and password to get started
        </CardDescription>
      </CardHeader>
      <CardContent>
        <EmailAuthForm mode="signup" />
      </CardContent>
      <CardFooter className="flex-col items-center space-y-2">
        <p className="px-8 text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{' '}
          and{' '}
          <Link href="#" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
        <p className="text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline underline-offset-4">
            Login
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
