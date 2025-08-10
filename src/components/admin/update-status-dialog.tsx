
'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { updateUserStatus, type UserProfile } from '@/actions/users';
import { Loader2 } from 'lucide-react';
import { Label } from '../ui/label';

interface UpdateStatusDialogProps {
    isOpen: boolean;
    onClose: (refresh?: boolean) => void;
    member?: UserProfile;
}

const STATUSES: UserProfile['status'][] = ['Active', 'Suspended', 'Resigned'];

export function UpdateStatusDialog({ isOpen, onClose, member }: UpdateStatusDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<UserProfile['status'] | undefined>(member?.status);

    const handleSubmit = async () => {
        if (!member || !selectedStatus) return;
        setLoading(true);
        const result = await updateUserStatus(member.id, selectedStatus);
        setLoading(false);

        if (result.success) {
            toast({ title: "Status Updated", description: `Member status changed to ${selectedStatus}.` });
            onClose(true);
        } else {
            toast({
                variant: 'destructive',
                title: "Error",
                description: result.error || "Could not update status.",
            });
        }
    };
    
    // Update local state if the member prop changes
    if (isOpen && member && selectedStatus !== member.status) {
      setSelectedStatus(member.status);
    }

    if (!isOpen || !member) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Update Member Status</DialogTitle>
                    <DialogDescription>
                        Change the status for {member.name}. This may affect their login access.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select
                            value={selectedStatus}
                            onValueChange={(value: UserProfile['status']) => setSelectedStatus(value)}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Select a status" />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUSES.map(status => (
                                    <SelectItem key={status} value={status}>
                                        {status}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary" onClick={() => onClose()}>Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleSubmit} disabled={loading || selectedStatus === member.status}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Update Status
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
