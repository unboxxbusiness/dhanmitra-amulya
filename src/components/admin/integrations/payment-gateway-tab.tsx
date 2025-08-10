
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CreditCard, Terminal } from "lucide-react";

export function PaymentGatewayTab() {
    const isKeySet = false; // This will be driven by env vars in a real app

    return (
        <Card>
            <CardHeader>
                <CardTitle>Payment Gateway (Razorpay)</CardTitle>
                <CardDescription>Configure and manage your Razorpay payment gateway integration.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <Alert>
                    <CreditCard className="h-4 w-4" />
                    <AlertTitle>Razorpay Integration Status</AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                        <span>API Key configured on server:</span>
                        <Badge variant={isKeySet ? 'default' : 'destructive'}>
                            {isKeySet ? 'CONFIGURED' : 'NOT SET'}
                        </Badge>
                    </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Under Construction</AlertTitle>
                    <AlertDescription>
                        This module provides the foundation for payment gateway integration.
                        The complete workflow for processing online deposits and loan repayments is a significant task
                        that will be implemented in a future update. This includes handling payment orders,
                        verifying webhook signatures, and updating member accounts automatically.
                    </AlertDescription>
                </Alert>
            </CardContent>
            <CardFooter>
                 <p className="text-xs text-muted-foreground">
                    To fully enable this feature, ensure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` are set in your server environment.
                 </p>
            </CardFooter>
        </Card>
    );
}
