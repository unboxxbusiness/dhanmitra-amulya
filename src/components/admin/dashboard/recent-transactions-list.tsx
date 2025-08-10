
import type { Transaction } from '@/lib/definitions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

function getInitials(name: string) {
    return name.split(' ').map((n) => n[0]).join('').substring(0,2);
}

export function RecentTransactionsList({ transactions }: { transactions: Transaction[] }) {
    if (transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                <p>No recent transactions.</p>
            </div>
        )
    }

  return (
    <div className="space-y-4">
      {transactions.map((tx) => (
        <div key={tx.id} className="flex items-center">
           <Avatar className="h-9 w-9">
            <AvatarImage src={`https://avatar.vercel.sh/${tx.userId}.png`} alt="Avatar" />
            <AvatarFallback>{getInitials(tx.userName || 'U')}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{tx.userName}</p>
            <p className="text-sm text-muted-foreground">{tx.description}</p>
          </div>
          <div className={cn("ml-auto font-medium", tx.type === 'credit' ? 'text-green-500' : 'text-red-500')}>
            {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
          </div>
        </div>
      ))}
    </div>
  );
}
