import { z } from 'zod';

export const ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor', 'member'] as const;
export type Role = (typeof ROLES)[number];

export type UserSession = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: Role;
};

// --- Deposit Schemas ---

export const TermSchema = z.object({
  durationMonths: z.number().int().positive(),
  interestRate: z.number().positive(),
});
export type Term = z.infer<typeof TermSchema>;

export const DepositProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  type: z.enum(['FD', 'RD']),
  description: z.string().min(10),
  terms: z.array(TermSchema).min(1),
  minDeposit: z.number().positive(),
  maxDeposit: z.number().positive(),
});
export type DepositProduct = z.infer<typeof DepositProductSchema>;

export type DepositApplication = {
    id: string;
    userId: string;
    userName: string;
    productName: string;
    productId: string;
    term: Term;
    principalAmount: number;
    status: 'pending' | 'approved' | 'rejected';
    applicationDate: string; // ISO String
}

export type ActiveDeposit = {
    id: string;
    userId: string;
    userName: string;
    productName: string;
    accountNumber: string;
    principalAmount: number;
    maturityAmount: number;
    interestRate: number;
    termMonths: number;
    startDate: string; // ISO String
    maturityDate: string; // ISO String
    status: 'active' | 'matured' | 'closed';
}
