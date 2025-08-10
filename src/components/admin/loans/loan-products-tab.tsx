
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { getLoanProducts } from '@/actions/loans';
import { useToast } from '@/hooks/use-toast';
import { AddLoanProductDialog } from './add-loan-product-dialog';
import type { LoanProduct } from '@/lib/definitions';

export function LoanProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getLoanProducts();
      setProducts(fetchedProducts);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching products',
        description: error.message || 'Could not load loan product data.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDialogClose = (refresh?: boolean) => {
    setAddDialogOpen(false);
    if (refresh) {
      fetchProducts();
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Loan Products</CardTitle>
          <CardDescription>Manage the loan products offered to members.</CardDescription>
          <div className="flex items-center gap-4 pt-4">
            <Button onClick={() => setAddDialogOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Name</TableHead>
                <TableHead>Interest Type</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Max Term</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.interestType === 'flat' ? 'default' : 'secondary'} className="capitalize">
                        {product.interestType.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.interestRate}%</TableCell>
                    <TableCell>{product.maxTermMonths} months</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No loan products found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddLoanProductDialog isOpen={isAddDialogOpen} onClose={handleDialogClose} />
    </>
  );
}
