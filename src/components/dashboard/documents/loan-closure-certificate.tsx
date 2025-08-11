
'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateLoanClosureCertificate } from '@/actions/users';
import type { ActiveLoan, LoanClosureCertificateData } from '@/lib/definitions';

export function LoanClosureCertificate({ loans }: { loans: ActiveLoan[] }) {
    const { toast } = useToast();
    const printRef = useRef(null);
    const [selectedLoanId, setSelectedLoanId] = useState<string>('');
    const [certificate, setCertificate] = useState<LoanClosureCertificateData | null>(null);
    const [loading, setLoading] = useState(false);

    const closedLoans = loans.filter(l => l.outstandingBalance <= 0);

    const handleGenerate = async () => {
        if (!selectedLoanId) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a closed loan account.' });
            return;
        }
        setLoading(true);
        setCertificate(null);
        try {
            const data = await generateLoanClosureCertificate(selectedLoanId);
            setCertificate(data);
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error Generating Certificate', description: 'Could not generate the certificate. Please try again.' });
        } finally {
            setLoading(false);
        }
    }
    
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `loan-closure-${selectedLoanId}`,
    });

    return (
        <Card>
            <CardHeader>
                <CardTitle>Loan Closure Certificate</CardTitle>
                <CardDescription>Generate a No-Dues / Closure certificate for a fully paid loan.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="loan-account">Closed Loan Account</Label>
                    <Select value={selectedLoanId} onValueChange={setSelectedLoanId}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a closed loan" />
                        </SelectTrigger>
                        <SelectContent>
                            {closedLoans.length > 0 ? closedLoans.map(loan => (
                                <SelectItem key={loan.id} value={loan.id}>{loan.productName}</SelectItem>
                            )) : <SelectItem value="none" disabled>No closed loans found</SelectItem>}
                        </SelectContent>
                    </Select>
                </div>
                 <Button onClick={handleGenerate} disabled={loading || !selectedLoanId}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                    Generate Certificate
                </Button>
            </CardContent>
            {certificate && (
                <>
                <CardContent ref={printRef} className="text-sm">
                    <div className="p-6 border rounded-lg">
                        <header className="text-center mb-6">
                            <h2 className="text-xl font-bold">{certificate.societyName}</h2>
                            <p>{certificate.societyAddress}</p>
                            <h3 className="text-lg font-semibold mt-4 underline">LOAN CLOSURE CERTIFICATE</h3>
                        </header>
                        <div className="space-y-2 mb-4">
                            <p><strong>Date:</strong> {certificate.generatedDate}</p>
                            <p><strong>To:</strong> {certificate.memberName}</p>
                            <p>{certificate.memberAddress}</p>
                        </div>
                        <p className="my-4">
                            This is to certify that the loan account detailed below, held by you with our society, has been fully repaid and is now closed.
                        </p>
                        <div className="my-4 space-y-2 border p-4 rounded-md">
                            <div className="flex justify-between"><span>Loan Product:</span><span className="font-mono">{certificate.loanAccountNumber}</span></div>
                            <div className="flex justify-between"><span>Loan Amount:</span><span>₹{certificate.loanAmount.toFixed(2)}</span></div>
                            <div className="flex justify-between"><span>Disbursal Date:</span><span>{certificate.disbursalDate}</span></div>
                        </div>
                        
                        <p className="my-4">All dues against the said loan account have been cleared, and the society has no further claim on this account.</p>

                        <p className="text-xs text-muted-foreground mt-8">This is a computer-generated statement and does not require a signature.</p>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handlePrint}><Download className="mr-2 h-4 w-4" /> Download / Print</Button>
                </CardFooter>
                </>
            )}
        </Card>
    );
}
