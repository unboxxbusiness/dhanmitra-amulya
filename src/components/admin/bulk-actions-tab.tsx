
import { FileUp, FileDown, UploadCloud } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function BulkActionsTab() {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Bulk Import Members</CardTitle>
          <CardDescription>
            Upload a CSV file to add multiple members at once. Ensure the file has 'name' and 'email' columns.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
            <UploadCloud className="w-12 h-12 text-muted-foreground" />
            <p className="mt-4 text-sm text-muted-foreground">Drag & drop your CSV file here, or click to select a file.</p>
            <Input id="csv-upload" type="file" accept=".csv" className="sr-only" />
            <Button asChild variant="outline" className="mt-4">
                <Label htmlFor="csv-upload">Select File</Label>
            </Button>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full">
            <FileUp className="mr-2 h-4 w-4" />
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
          <Button className="w-full" variant="secondary">
            <FileDown className="mr-2 h-4 w-4" />
            Export All Members
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
