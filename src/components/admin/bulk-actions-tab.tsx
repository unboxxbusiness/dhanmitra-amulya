
'use client';

import { useState } from 'react';
import { FileUp, FileDown, UploadCloud, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { bulkImportMembers, exportMembersToCsv } from '@/actions/users';
import { useToast } from '@/hooks/use-toast';

export function BulkActionsTab() {
  const { toast } = useToast();
  const [importFile, setImportFile] = useState<File | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setImportFile(event.target.files[0]);
    }
  };

  const handleImport = async () => {
    if (!importFile) {
      toast({ variant: 'destructive', title: "No file selected", description: "Please select a CSV file to import." });
      return;
    }

    setIsImporting(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      const csvContent = e.target?.result as string;
      const result = await bulkImportMembers(csvContent);

      if (result.success && result.results) {
        toast({
          title: "Import Complete",
          description: `${result.results.successful} members imported successfully. ${result.results.failed} failed.`,
        });
      } else {
        toast({
          variant: 'destructive',
          title: "Import Failed",
          description: result.error || "An unknown error occurred during import.",
        });
      }
      setIsImporting(false);
      setImportFile(null);
    };
    reader.readAsText(importFile);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const csvString = await exportMembersToCsv();
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `amulya-members-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Export Successful', description: 'Member data has been downloaded.' });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Export Failed',
        description: error.message || 'Could not export member data.',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Members</CardTitle>
          <CardDescription>
            Upload a CSV file to add multiple members at once. The file must have 'name' and 'email' columns. A temporary password will be created for new users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Drag & drop your CSV file here, or click to select a file.</p>
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
          <Button className="w-full" onClick={handleImport} disabled={isImporting || !importFile}>
            {isImporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileUp className="mr-2 h-4 w-4" />}
            Upload and Process File
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Export Members</CardTitle>
          <CardDescription>
            Download a CSV file containing all current members and their information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-6 text-center">
            <p className="text-sm text-muted-foreground">Click the button below to generate and download the member data as a CSV file.</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="secondary" onClick={handleExport} disabled={isExporting}>
            {isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />}
            Export All Members
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
