
'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { deleteMember, type UserProfile } from '@/actions/users';
import { Loader2 } from 'lucide-react';

interface DeleteMemberAlertProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    member?: UserProfile;
}

export function DeleteMemberAlert({ isOpen, onClose, member }: DeleteMemberAlertProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!member) return;
        setLoading(true);
        const result = await deleteMember(member.id);
        setLoading(false);

        if (result.success) {
            toast({ title: "Member Deleted", description: `The account for ${member.name} has been permanently removed.` });
            onClose(true);
        } else {
            toast({
                variant: 'destructive',
                title: "Error",
                description: result.error || "Could not delete member.",
            });
            onClose();
        }
    };
    
    if (!isOpen || !member) return null;

    return (
        <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the account
                    for <span className="font-semibold">{member.name}</span> and remove all their associated data from Firebase Authentication and Firestore.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel asChild>
                    <Button variant="secondary" onClick={() => onClose()} disabled={loading}>Cancel</Button>
                </AlertDialogCancel>
                <AlertDialogAction asChild>
                     <Button variant="destructive" onClick={handleDelete} disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Yes, Delete Member
                    </Button>
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
