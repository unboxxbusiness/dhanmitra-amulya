
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { KeyRound, Loader2, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { sendPasswordReset } from '@/actions/users';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export function ChangePasswordCard() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleChangePassword = async () => {
        setLoading(true);
        const result = await sendPasswordReset();
        if (result.success) {
            toast({
                title: 'Password Reset Email Sent',
                description: 'Please check your inbox for a link to reset your password.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error || 'Failed to send password reset email.',
            });
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                    For your security, we will send a reset link to your registered email address.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Alert>
                    <Mail className="h-4 w-4" />
                    <AlertTitle>Email Verification</AlertTitle>
                    <AlertDescription>
                        Clicking the button below will send an email. You won't be logged out from this device.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                <Button onClick={handleChangePassword} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                    Send Password Reset Link
                </Button>
            </CardFooter>
        </Card>
    );
}
