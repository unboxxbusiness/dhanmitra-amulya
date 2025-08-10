
'use client';

import { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Download, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateInterestCertificate } from '@/actions/users';
import type { InterestCertificateData } from '@/lib/definitions';
import { Separator } from '@/components/ui/separator';

function generateFinancialYears() {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i < 5; i++) {
        const startYear = currentYear - i -1;
        const endYear = startYear + 1;
        years.push(`${startYear}-${endYear.toString().slice(-2)}`);
    }
    return years;
}


export function InterestCertificate() {
    const { toast } = useToast();
    const printRef = useRef(null);
    const [selectedYear, setSelectedYear] = useState<string>(generateFinancialYears()[0]);
    const [certificate, setCertificate] = useState<InterestCertificateData | null>(null);
    const [loading, setLoading] = useState(false);

    const handleGenerate = async () => {
        setLoading(true);
        setCertificate(null);
        try {
            const data = await generateInterestCertificate(selectedYear);
            setCertificate(data);
        } catch (error: any) {
             toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    }
    
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        documentTitle: `interest-certificate-${selectedYear}`,
    });


    return (
        <Card>
            <CardHeader>
                <CardTitle>Interest Certificate</CardTitle>
                <CardDescription>Generate a provisional interest certificate for a financial year.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="financial-year">Financial Year</Label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                        </SelectTrigger>
                        <SelectContent>
                            {generateFinancialYears().map(year => (
                                <SelectItem key={year} value={year}>{year}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                 <Button onClick={handleGenerate} disabled={loading}>
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
                            <h3 className="text-lg font-semibold mt-4 underline">PROVISIONAL INTEREST CERTIFICATE</h3>
                        </header>
                        <div className="space-y-2 mb-4">
                            <p><strong>To:</strong> {certificate.memberName}</p>
                            <p>{certificate.memberAddress}</p>
                            <p><strong>Date:</strong> {certificate.generatedDate}</p>
                        </div>
                        <p>This is to certify that the following interest has been paid/accrued to you for the financial year <strong>{certificate.financialYear}</strong> on your deposits with us:</p>
                        <table className="w-full my-4 border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="p-2 text-left">Account No.</th>
                                    <th className="p-2 text-right">Principal (₹)</th>
                                    <th className="p-2 text-right">Interest Rate (%)</th>
                                    <th className="p-2 text-right">Interest Earned (₹)</th>
                                </tr>
                            </thead>
                            <tbody>
                                {certificate.accounts.map(acc => (
                                <tr key={acc.accountNumber} className="border-b">
                                    <td className="p-2">{acc.accountNumber}</td>
                                    <td className="p-2 text-right">{acc.principal.toFixed(2)}</td>
                                    <td className="p-2 text-right">{acc.rate.toFixed(2)}%</td>
                                    <td className="p-2 text-right">{acc.interestEarned.toFixed(2)}</td>
                                </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={3} className="p-2 text-right font-bold">Total Interest</td>
                                    <td className="p-2 text-right font-bold">₹{certificate.totalInterest.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                        <Separator className="my-4"/>
                        <p className="text-xs text-muted-foreground">This is a computer-generated statement and does not require a signature. The interest amount is provisional and subject to change.</p>
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
