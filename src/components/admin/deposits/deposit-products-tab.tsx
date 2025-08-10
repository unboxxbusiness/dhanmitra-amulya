
'use client';

import { useState, useEffect } from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from '@/components/ui/badge';
import { getDepositProducts, type DepositProduct } from '@/actions/deposits';
import { useToast } from '@/hooks/use-toast';
import { AddProductDialog } from './add-product-dialog';

export function DepositProductsTab() {
  const { toast } = useToast();
  const [products, setProducts] = useState<DepositProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setAddDialogOpen] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const fetchedProducts = await getDepositProducts();
      setProducts(fetchedProducts);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error fetching products',
        description: error.message || 'Could not load deposit product data.'
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
          <CardTitle>Deposit Products</CardTitle>
          <CardDescription>Manage the FD and RD products offered to members.</CardDescription>
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
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Terms</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[250px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  </TableRow>
                ))
              ) : products.length > 0 ? (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      <Badge variant={product.type === 'FD' ? 'default' : 'secondary'}>
                        {product.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{product.description}</TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            {product.terms.map((term, i) => (
                                <span key={i} className="text-xs">
                                    {term.durationMonths} months at {term.interestRate}%
                                </span>
                            ))}
                        </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">
                    No deposit products found. Create one to get started.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <AddProductDialog isOpen={isAddDialogOpen} onClose={handleDialogClose} />
    </>
  );
}
