
'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from '@/hooks/use-toast';
import { sendNotification } from '@/actions/notifications';
import { getAllMembers, type UserProfile } from '@/actions/users';
import { Loader2, Send } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';

const templates = [
    { value: 'custom', label: 'Custom Message' },
    { value: 'kyc_approved', title: 'KYC Approved', body: 'Congratulations! Your KYC documents have been approved.' },
    { value: 'loan_approved', title: 'Loan Approved', body: 'Your recent loan application has been approved and will be disbursed shortly.' },
    { value: 'payment_due', title: 'Payment Reminder', body: 'Your upcoming EMI payment is due soon. Please ensure your account is funded.' },
];

export function NotificationComposer() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [targetType, setTargetType] = useState<'all' | 'single'>('all');
  
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  useEffect(() => {
    async function fetchMembers() {
        setLoadingMembers(true);
        try {
            const fetchedMembers = await getAllMembers();
            setMembers(fetchedMembers);
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Failed to load members list.' });
        } finally {
            setLoadingMembers(false);
        }
    }
    fetchMembers();
  }, [toast]);

  const handleTemplateChange = (templateValue: string) => {
    const template = templates.find(t => t.value === templateValue);
    if (template) {
        setTitle(template.title || '');
        setBody(template.body || '');
    }
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (targetType === 'single' && !selectedUserId) {
        toast({ variant: 'destructive', title: 'Error', description: 'Please select a member to notify.'});
        return;
    }
    
    setLoading(true);
    const result = await sendNotification({
        target: targetType,
        userId: selectedUserId,
        title,
        body
    });

    if (result.success) {
        toast({ title: 'Success', description: result.message });
        setTitle('');
        setBody('');
    } else {
        toast({ variant: 'destructive', title: 'Failed to Send', description: result.error });
    }

    setLoading(false);
  }

  const memberOptions = members.map(member => ({
    value: member.id,
    label: `${member.name} (${member.email})`
  }));

  return (
    <Card className="max-w-2xl">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle>Compose Notification</CardTitle>
          <CardDescription>
            Select your audience and compose your message.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <RadioGroup value={targetType} onValueChange={(v: 'all' | 'single') => setTargetType(v)} className="flex gap-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="all" id="all" />
                <Label htmlFor="all">All Members</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="single" id="single" />
                <Label htmlFor="single">Single Member</Label>
              </div>
            </RadioGroup>
          </div>

          {targetType === 'single' && (
            <div className="space-y-2">
              <Label htmlFor="member">Select Member</Label>
              {loadingMembers ? (
                  <div className="flex items-center space-x-2"><Loader2 className="h-4 w-4 animate-spin"/><span>Loading members...</span></div>
              ) : (
                <Combobox
                    options={memberOptions}
                    value={selectedUserId}
                    onChange={setSelectedUserId}
                    placeholder="Search for a member..."
                    emptyPlaceholder="No member found."
                />
              )}
            </div>
          )}

           <div className="space-y-2">
            <Label htmlFor="template">Message Template</Label>
            <Select onValueChange={handleTemplateChange} defaultValue="custom">
                <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                </SelectTrigger>
                <SelectContent>
                    {templates.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Notification Title" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Body</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Your message content..." required />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
            Send Notification
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
