
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type UserProfile } from "@/lib/definitions";
import { useToast } from "@/hooks/use-toast";
import { updateMemberProfile } from '@/actions/users';
import { Loader2 } from 'lucide-react';
import { Separator } from '../ui/separator';

const ProfileFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  phone: z.string().min(10, "Please enter a valid phone number."),
  address: z.string().min(10, "Please enter a valid address."),
  nominee: z.object({
    name: z.string().min(2, "Nominee name is required."),
    relationship: z.string().min(2, "Relationship is required."),
  }),
});

type FormValues = z.infer<typeof ProfileFormSchema>;

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(ProfileFormSchema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone,
      address: profile.address,
      nominee: profile.nominee,
    },
  });

  const onSubmit = async (data: FormValues) => {
    const result = await updateMemberProfile(data);
    if (result.success) {
      toast({
        title: "Profile Updated",
        description: "Your personal information has been saved.",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: result.error,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>Keep your contact and nominee details up to date.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
            {/* Personal Information */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" {...register('name')} />
                        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" value={profile.email} disabled />
                        <p className="text-xs text-muted-foreground">Email address cannot be changed.</p>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" {...register('phone')} />
                    {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Full Address</Label>
                    <Input id="address" {...register('address')} />
                    {errors.address && <p className="text-sm text-destructive">{errors.address.message}</p>}
                </div>
            </div>

            <Separator />

            {/* Nominee Details */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">Nominee Details</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="nomineeName">Nominee Full Name</Label>
                        <Input id="nomineeName" {...register('nominee.name')} />
                        {errors.nominee?.name && <p className="text-sm text-destructive">{errors.nominee.name.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="nomineeRelationship">Relationship</Label>
                        <Input id="nomineeRelationship" {...register('nominee.relationship')} />
                        {errors.nominee?.relationship && <p className="text-sm text-destructive">{errors.nominee.relationship.message}</p>}
                    </div>
                </div>
            </div>

            <Separator />

            {/* KYC Documents */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium">KYC Documents</h3>
                <p className="text-sm text-muted-foreground">
                    Your KYC documents are on file. To make changes, please contact support.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a href={profile.kycDocs?.id} target="_blank" rel="noopener noreferrer" className="text-primary underline">View ID Document</a>
                    <a href={profile.kycDocs?.photo} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Photo</a>
                    <a href={profile.kycDocs?.addressProof} target="_blank" rel="noopener noreferrer" className="text-primary underline">View Address Proof</a>
                </div>
            </div>

        </CardContent>
        <CardFooter className="border-t pt-6">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
