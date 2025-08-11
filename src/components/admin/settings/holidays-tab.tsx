

'use client';

import { useState, useEffect, useTransition, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { getHolidays, addHoliday, deleteHoliday } from '@/actions/settings';
import type { Holiday } from '@/lib/definitions';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

function SubmitButton({ isPending }: { isPending: boolean }) {
    return (
        <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Add Holiday
        </Button>
    )
}

export function HolidaysTab() {
    const { toast } = useToast();
    const [holidays, setHolidays] = useState<Holiday[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddDialogOpen, setAddDialogOpen] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [isPending, startTransition] = useTransition();

    const fetchHolidays = async () => {
        setLoading(true);
        try {
            const data = await getHolidays();
            setHolidays(data);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message });
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchHolidays();
    }, []);

    const handleFormAction = (formData: FormData) => {
        startTransition(async () => {
            const result = await addHoliday(null, formData);
            if(result.success) {
                toast({ title: "Holiday Added" });
                fetchHolidays();
                setAddDialogOpen(false);
                formRef.current?.reset();
            } else if (result.error) {
                toast({ variant: 'destructive', title: "Error", description: result.error });
            }
        });
    }

    const handleDelete = async (id: string) => {
        const result = await deleteHoliday(id);
        if (result.success) {
            toast({ title: 'Holiday Removed' });
            fetchHolidays();
        } else {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
    }

    const holidayDates = holidays.map(h => new Date(h.date));

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Holiday Calendar</CardTitle>
                    <CardDescription>View and manage the holiday calendar for the year.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center">
                    <Calendar
                        mode="multiple"
                        selected={holidayDates}
                        disabled={{ before: new Date() }}
                        className="rounded-md border"
                    />
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Manage Holidays</CardTitle>
                    <CardDescription>Add or remove holidays from the calendar.</CardDescription>
                </CardHeader>
                <CardContent>
                     <ul className="space-y-2 max-h-60 overflow-y-auto">
                        {loading ? (
                            Array.from({length: 4}).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)
                        ) : holidays.length > 0 ? (
                            holidays.map(holiday => (
                                <li key={holiday.id} className="flex items-center justify-between p-2 rounded-md border">
                                    <div>
                                        <p className="font-medium">{holiday.name}</p>
                                        <p className="text-sm text-muted-foreground">{format(new Date(holiday.date), 'PPP')}</p>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(holiday.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </li>
                            ))
                        ) : (
                             <p className="text-center text-muted-foreground py-4">No holidays added yet.</p>
                        )}
                    </ul>
                </CardContent>
                <CardFooter>
                     <Dialog open={isAddDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Holiday
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form ref={formRef} action={handleFormAction}>
                                <input type="hidden" name="date" value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''} />
                                <DialogHeader>
                                    <DialogTitle>Add New Holiday</DialogTitle>
                                    <DialogDescription>Enter the details for the new holiday.</DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="space-y-2">
                                        <Label>Date</Label>
                                         <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !selectedDate && "text-muted-foreground"
                                                    )}
                                                >
                                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                                    {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={selectedDate}
                                                onSelect={setSelectedDate}
                                                initialFocus
                                            />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Holiday Name</Label>
                                        <Input id="name" name="name" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="type">Type</Label>
                                        <Select name="type" required defaultValue="National">
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="National">National Holiday</SelectItem>
                                                <SelectItem value="Regional">Regional Holiday</SelectItem>
                                                <SelectItem value="Cooperative">Cooperative Holiday</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
                                    <SubmitButton isPending={isPending} />
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </CardFooter>
            </Card>
        </div>
    );
}
