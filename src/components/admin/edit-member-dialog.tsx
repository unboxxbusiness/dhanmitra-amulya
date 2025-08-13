

'use client';

import { useEffect, useState, useTransition, useRef } from 'react';
import { useFormStatus } from 'react-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserProfile, type UserProfile } from '@/actions/users';
import { sendPasswordResetEmail } from '@/actions/auth';
import { ROLES } from '@/lib/definitions';
import { Loader2, KeyRound } from 'lucide-react';
import { Separator } from '../ui/separator';

interface EditMemberDialogProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    member?: UserProfile;
}

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Changes
        </Button>
    )
}

export function EditMemberDialog({ isOpen, onClose, member }: EditMemberDialogProps) {
    const { toast } = useToast();
    const [isPending, startTransition] = useTransition();
    const [isSendingReset, setIsSendingReset] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    
    const handleFormAction = (formData: FormData) => {
        if (!member) return;
        startTransition(async () => {
            const result = await updateUserProfile(member.id, formData);
            if (result.success) {
                toast({ title: "Profile Updated", description: "The member's profile has been saved." });
                onClose(true);
            } else {
                 toast({
                    variant: 'destructive',
                    title: "Error",
                    description: result.error,
                });
            }
        });
    }

    const handleSendResetEmail = async () => {
        if (!member?.email) return;
        setIsSendingReset(true);
        const result = await sendPasswordResetEmail(member.email);
        if (result.success) {
            toast({ title: "Email Sent", description: `A password reset link has been sent to ${member.email}.` });
        } else {
            toast({ variant: 'destructive', title: "Error", description: result.error });
        }
        setIsSendingReset(false);
    }

    if (!isOpen || !member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md">
                <form ref={formRef} action={handleFormAction}>
                    <DialogHeader>
                        <DialogTitle>Edit Member Profile</DialogTitle>
                        <DialogDescription>
                            Modify the details for {member.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">Name</Label>
                            <Input id="name" name="name" className="col-span-3" defaultValue={member.name ?? ''} required />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="email" className="text-right">Email</Label>
                            <Input id="email" name="email" type="email" className="col-span-3" defaultValue={member.email ?? ''} disabled />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="role" className="text-right">Role</Label>
                             <Select name="role" defaultValue={member.role} required>
                                <SelectTrigger className="col-span-3">
                                    <SelectValue placeholder="Select a role" />
                                </SelectTrigger>
                                <SelectContent>
                                    {ROLES.map(role => (
                                        <SelectItem key={role} value={role} className="capitalize">
                                            {role.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                             <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
                <Separator className="my-4" />
                 <div className="space-y-2">
                    <p className="text-sm font-medium">Security Actions</p>
                    <Button variant="outline" size="sm" onClick={handleSendResetEmail} disabled={isSendingReset}>
                        {isSendingReset ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        Send Reset Password
                    </Button>
                     <p className="text-xs text-muted-foreground">This will send a password reset link to the member's email address.</p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
