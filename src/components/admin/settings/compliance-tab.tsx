
'use client';

import { useEffect } from 'react';
import { useFormStatus, useFormState } from 'react-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Loader2 } from 'lucide-react';
import { exportMembersToCsv } from '@/actions/users';
import { updateComplianceSettings } from '@/actions/settings';
import type { SocietyConfig } from '@/lib/definitions';

const initialState = { success: false, error: null };

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Policy
        </Button>
    )
}

export function ComplianceTab({ config }: { config: SocietyConfig }) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [state, formAction] = useFormState(updateComplianceSettings, initialState);

  useEffect(() => {
    if (state.success) {
      toast({ title: 'Policy Saved', description: 'Compliance settings have been updated.'});
      state.success = false;
    } else if (state.error) {
      toast({ variant: 'destructive', title: 'Error', description: state.error });
      state.error = null;
    }
  }, [state, toast]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const csvString = await exportMembersToCsv();
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'regulator-member-export.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast({ title: 'Export Successful' });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Export Failed', description: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <form action={formAction}>
          <CardHeader>
            <CardTitle>KYC Document Retention</CardTitle>
            <CardDescription>
              Define the policy for how long to retain KYC documents after an account is closed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="kycRetentionYears">Retention Period (Years)</Label>
              <Input id="kycRetentionYears" name="kycRetentionYears" type="number" defaultValue={config.kycRetentionYears} />
            </div>
            <p className="text-sm text-muted-foreground">
                Note: This is a policy setting. Actual data purging would need to be implemented as a separate scheduled backend process.
              </p>
          </CardContent>
          <CardFooter>
            <SubmitButton />
          </CardFooter>
        </form>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Data Export for Regulator</CardTitle>
          <CardDescription>
            Generate and download data exports required for regulatory reporting.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This action will export a complete list of all members. More complex exports can be added here as needed.
          </p>
        </CardContent>
        <CardFooter>
          <Button className="w-full" variant="secondary" onClick={handleExport} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
            Export Member List
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
