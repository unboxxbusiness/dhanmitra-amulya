
'use client';

import { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { Transaction } from '@/lib/definitions';

interface ReceiptDialogProps {
    isOpen: boolean;
    onClose: () => void;
    transaction: Transaction;
}

export function ReceiptDialog({ isOpen, onClose, transaction }: ReceiptDialogProps) {
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `receipt-${transaction.id}`,
  });

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div ref={componentRef} className="p-4">
            <DialogHeader className="mb-4">
                <DialogTitle className="text-center text-2xl">Transaction Receipt</DialogTitle>
                <DialogDescription className="text-center">Amulya Cooperative Society</DialogDescription>
            </DialogHeader>

            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span>Transaction ID:</span>
                    <span className="font-mono">{transaction.id}</span>
                </div>
                <div className="flex justify-between">
                    <span>Date:</span>
                    <span>{new Date(transaction.date).toLocaleString()}</span>
                </div>
                 <div className="flex justify-between">
                    <span>Teller:</span>
                    <span>{transaction.tellerName}</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                    <span>Member:</span>
                    <span className="font-medium">{transaction.userName}</span>
                </div>
                <div className="flex justify-between">
                    <span>Account Number:</span>
                    <span className="font-mono">{transaction.accountNumber}</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2">
                <div className="flex justify-between">
                    <span>Description:</span>
                    <span>{transaction.description}</span>
                </div>
                 <div className="flex justify-between font-semibold text-lg">
                    <span>Type:</span>
                    <span className="capitalize">{transaction.type}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg">
                    <span>Amount:</span>
                    <span>${transaction.amount.toFixed(2)}</span>
                </div>
            </div>

             <Separator className="my-4" />

             <div className="space-y-2 text-sm">
                 <div className="flex justify-between">
                    <span>Balance Before:</span>
                    <span className="font-mono">${(transaction as any).balanceBefore.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span>Balance After:</span>
                    <span className="font-mono font-bold">${(transaction as any).balanceAfter.toFixed(2)}</span>
                </div>
            </div>

            <p className="text-center text-xs text-muted-foreground mt-6">Thank you for banking with us.</p>
        </div>

        <DialogFooter className="mt-4">
          <Button type="button" variant="outline" onClick={onClose}>Close</Button>
          <Button onClick={handlePrint}>Print Receipt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
