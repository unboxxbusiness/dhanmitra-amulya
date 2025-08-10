
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { revokeAllSessions } from '@/actions/users';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function SessionManagementCard() {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleRevoke = async () => {
        setLoading(true);
        const result = await revokeAllSessions();
        if (result.success) {
            toast({
                title: 'Sessions Revoked',
                description: 'All other active sessions have been logged out. Please log in again on those devices.',
            });
        } else {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: result.error || 'Failed to revoke sessions.',
            });
        }
        setLoading(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>
                    Log out from all other devices where your account might be active.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                    If you suspect unauthorized access to your account, use this feature to immediately log out everywhere else. You will remain logged in on this device.
                </p>
            </CardContent>
            <CardFooter>
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                            Log out from all other devices
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will sign you out of Amulya on all other computers and devices. You will need to log in again on those devices.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleRevoke}>Confirm & Log Out</AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    );
}
