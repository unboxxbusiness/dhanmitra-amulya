

'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from '@/components/ui/textarea';
import { getSavingsSchemes, addSavingsScheme, type SavingsScheme } from '@/actions/savings';
import { useToast } from '@/hooks/use-toast';

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Scheme
        </Button>
    )
}

export function SavingsSchemesTab() {
  const { toast } = useToast();
  const [schemes, setSchemes] = useState<SavingsScheme[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const fetchedSchemes = await getSavingsSchemes();
      setSchemes(fetchedSchemes);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error fetching schemes',
        description: 'Could not load savings scheme data.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchSchemes();
  }, []);

  const handleFormAction = (formData: FormData) => {
    startTransition(async () => {
        const result = await addSavingsScheme(null, formData);
        if (result.success) {
            toast({ title: "Scheme Added", description: "The new savings scheme has been created." });
            fetchSchemes();
            setIsDialogOpen(false); // Close dialog on success
        } else {
            toast({
                variant: 'destructive',
                title: "Error",
                description: result.error
            });
        }
    });
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Savings Schemes</CardTitle>
          <CardDescription>Define the savings products your cooperative offers.</CardDescription>
           <div className="flex items-center gap-4 pt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                    <Button>
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Scheme
                    </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                    <form ref={formRef} action={handleFormAction}>
                        <DialogHeader>
                            <DialogTitle>Add New Savings Scheme</DialogTitle>
                            <DialogDescription>
                                Create a new savings product with its own interest rate.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">Scheme Name</Label>
                                <Input id="name" name="name" className="col-span-3" required />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="interestRate" className="text-right">Interest Rate (%)</Label>
                                <Input id="interestRate" name="interestRate" type="number" step="0.01" placeholder="e.g. 5.5" className="col-span-3" required />
                            </div>
                             <div className="grid grid-cols-4 items-start gap-4">
                                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                                <Textarea id="description" name="description" className="col-span-3" required />
                            </div>
                        </div>
                        <DialogFooter>
                            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                            <SubmitButton isPending={isPending} />
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Scheme Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Interest Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px] ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : (
                schemes.map((scheme) => (
                  <TableRow key={scheme.id}>
                    <TableCell className="font-medium">{scheme.name}</TableCell>
                    <TableCell>{scheme.description}</TableCell>
                    <TableCell className="text-right font-semibold">{scheme.interestRate.toFixed(2)}%</TableCell>
                  </TableRow>
                ))
              )}
               {!loading && schemes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center">
                    No savings schemes found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
}
