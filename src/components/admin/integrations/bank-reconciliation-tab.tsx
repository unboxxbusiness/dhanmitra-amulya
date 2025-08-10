
'use client';

import { useState } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { reconcileBankStatement } from '@/actions/transactions';
import { useToast } from '@/hooks/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";


type ReconciliationResult = {
    matched: number;
    unmatched: number;
    discrepancies: any[];
}

export function BankReconciliationTab() {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ReconciliationResult | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImportFile(event.target.files[0]);
      setResults(null); // Clear previous results
    }
  };

  const handleReconciliation = async () => {
    if (!importFile) {
      toast({ variant: 'destructive', title: "No file selected", description: "Please select a CSV file to process." });
      return;
    }

    setIsProcessing(true);
    setResults(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target?.result as string;
      const result = await reconcileBankStatement(csvContent);

      if (result.success && result.results) {
        setResults(result.results);
        toast({
          title: "Reconciliation Complete",
          description: `Found ${result.results.matched} matched and ${result.results.unmatched} unmatched transactions.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: "Processing Failed",
          description: result.error || "An unknown error occurred.",
        });
      }
      setIsProcessing(false);
    };
    reader.readAsText(importFile);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upload Bank Statement</CardTitle>
          <CardDescription>
            Upload a CSV file from your bank to reconcile with system transactions. Expected columns: 'Date', 'Description', 'Amount'.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Select your bank statement CSV file.</p>
            <Input id="csv-upload" type="file" accept=".csv" className="sr-only" onChange={handleFileChange} />
            {importFile ? (
                <p className="mt-2 text-sm font-medium">{importFile.name}</p>
            ) : (
                <p className="mt-2 text-sm text-muted-foreground">No file chosen</p>
            )}
            <Button asChild variant="outline" className="mt-4">
                <Label htmlFor="csv-upload">Select File</Label>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleReconciliation} disabled={isProcessing || !importFile}>
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Process Statement
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Reconciliation Results</CardTitle>
          <CardDescription>
            Summary of the reconciliation process.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {results ? (
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-4 bg-green-100 text-green-800 rounded-lg">
                        <p className="text-2xl font-bold">{results.matched}</p>
                        <p className="text-sm">Matched</p>
                    </div>
                     <div className="p-4 bg-red-100 text-red-800 rounded-lg">
                        <p className="text-2xl font-bold">{results.unmatched}</p>
                        <p className="text-sm">Unmatched</p>
                    </div>
                </div>

                {results.discrepancies.length > 0 && (
                    <div>
                        <h4 className="font-semibold mb-2">Unmatched Transactions</h4>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Amount</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.discrepancies.map((d, i) => (
                                    <TableRow key={i}>
                                        <TableCell>{d.description}</TableCell>
                                        <TableCell>{d.amount}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
          ) : (
            <div className="p-6 text-center text-muted-foreground">
                <p>Results will be displayed here after processing a statement.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
