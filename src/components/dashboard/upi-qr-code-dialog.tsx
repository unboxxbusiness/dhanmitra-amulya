
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import QRCode from 'qrcode';
import Image from 'next/image';
import { Loader2 } from 'lucide-react';

interface UpiQrCodeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  upiId: string;
  name: string;
  amount: number;
  notes: string;
}

export function UpiQrCodeDialog({ isOpen, onClose, upiId, name, amount, notes }: UpiQrCodeDialogProps) {
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      const upiUrl = new URL('upi://pay');
      upiUrl.searchParams.set('pa', upiId);
      upiUrl.searchParams.set('pn', name);
      upiUrl.searchParams.set('cu', 'INR');
      upiUrl.searchParams.set('tn', notes);
      if (amount > 0) {
        upiUrl.searchParams.set('am', amount.toFixed(2));
      }
      
      QRCode.toDataURL(upiUrl.toString(), { errorCorrectionLevel: 'M' })
        .then(url => {
          setQrCodeDataUrl(url);
        })
        .catch(err => {
          console.error(err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [isOpen, upiId, name, amount, notes]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scan to Pay</DialogTitle>
          <DialogDescription>
            Use any UPI app to scan the QR code and complete your payment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4">
            {loading && <Loader2 className="h-16 w-16 animate-spin" />}
            {!loading && qrCodeDataUrl && (
                <Image src={qrCodeDataUrl} alt="UPI QR Code" width={256} height={256} />
            )}
        </div>
        <div className="space-y-2 text-center text-sm">
            <p><strong>Amount:</strong> {amount > 0 ? `₹${amount.toFixed(2)}` : 'Enter amount in your app'}</p>
            <p><strong>Reference:</strong> <span className="font-mono">{notes}</span></p>
        </div>
        <div className="mt-4 text-center text-xs text-muted-foreground">
            After paying, please contact support with the reference ID to have your payment credited.
        </div>
      </DialogContent>
    </Dialog>
  );
}
