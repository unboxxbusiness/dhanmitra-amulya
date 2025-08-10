

import { z } from 'zod';

export const ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor', 'member'] as const;
export type Role = (typeof ROLES)[number];
export const ADMIN_ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor'];


export type UserSession = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: Role;
};

// --- User Profile & Applications ---

const KycDocsSchema = z.object({
    id: z.string().url(),
    photo: z.string().url(),
    addressProof: z.string().url(),
});
export type KycDocs = z.infer<typeof KycDocsSchema>;

const NomineeSchema = z.object({
    name: z.string().min(2, "Nominee name is required."),
    relationship: z.string().min(2, "Relationship is required."),
});
export type Nominee = z.infer<typeof NomineeSchema>;

export const UserProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Name is required."),
  email: z.string().email(),
  phone: z.string().min(10, "A valid phone number is required."),
  address: z.string().min(10, "A valid address is required."),
  nominee: NomineeSchema,
  kycDocs: KycDocsSchema.optional(), // KYC docs are associated with the user profile
  joinDate: z.string().optional(),
  status: z.enum(['Active', 'Suspended', 'Resigned', 'Pending']).optional(),
  role: z.enum(ROLES).optional(),
  fcmTokens: z.array(z.string()).optional(),
});
export type UserProfile = z.infer<typeof UserProfileSchema>;


export type Application = {
    id: string;
    name: string;
    email: string;
    applyDate: string;
    status: 'pending' | 'approved' | 'rejected';
    kycDocs: {
        id: string;
        photo: string;
        addressProof: string;
    }
}


// --- Deposit Schemas ---

export const TermSchema = z.object({
  durationMonths: z.coerce.number().int().positive(),
  interestRate: z.coerce.number().positive(),
});
export type Term = z.infer<typeof TermSchema>;

export const DepositProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(3),
  type: z.enum(['FD', 'RD']),
  description: z.string().min(10),
  terms: z.array(TermSchema).min(1),
  minDeposit: z.coerce.number().positive(),
  maxDeposit: z.coerce.number().positive(),
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
    productName?: string;
    accountNumber: string;
    principalAmount: number;
    maturityAmount: number;
    interestRate: number;
    termMonths: number;
    startDate: string; // ISO String
    maturityDate: string; // ISO String
    status: 'active' | 'matured' | 'closed';
}


// --- Loan Schemas ---

export const LoanProductSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(3, "Product name is required."),
    interestType: z.enum(['flat', 'reducing_balance']),
    interestRate: z.coerce.number().positive("Interest rate must be positive."),
    maxTermMonths: z.coerce.number().int().positive("Max term must be a positive number of months."),
    collateralNotes: z.string().optional(),
});
export type LoanProduct = z.infer<typeof LoanProductSchema>;

export const LoanApplicationSchema = z.object({
    productId: z.string().min(1),
    amountRequested: z.coerce.number().positive(),
    termMonths: z.coerce.number().int().positive(),
});
export type LoanApplication = z.infer<typeof LoanApplicationSchema>;

export type LoanApplicationDetails = {
    id: string;
    userId: string;
    userName: string;
    productName: string;
    productId: string;
    amountRequested: number;
    termMonths: number;
    status: 'pending' | 'verified' | 'approved' | 'rejected' | 'disbursed';
    applicationDate: string; // ISO String
    verifierName?: string;
    approverName?: string;
}

export type Repayment = {
    repaymentId: string;
    dueDate: string; // ISO String
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    paymentDate?: string; // ISO String
}

export type ActiveLoan = {
    id: string;
    userId: string;
    userName?: string;
    productName?: string;
    accountNumber: string;
    principal: number;
    interestRate: number;
    termMonths: number;
    emiAmount: number;
    disbursalDate: string; // ISO String
    outstandingBalance: number;
    repaymentSchedule: Repayment[];
}

export type RepaymentWithLoanDetails = {
    id: string;
    userName: string;
    accountNumber: string;
    emiAmount: number;
    dueDate: string;
    status: Repayment['status'];
    loanId: string;
    repaymentId: string;
    repaymentIndex: number;
    paymentDate?: string;
}

// --- Savings & Transaction Schemas ---
export type SavingsScheme = {
    id: string;
    name: string;
    interestRate: number;
    description: string;
}

export type SavingsAccount = {
    id: string;
    userId: string;
    userName?: string;
    schemeId: string;
    schemeName?: string;
    accountNumber: string;
    balance: number;
    status: 'Active' | 'Dormant' | 'Closed';
    createdAt: string; // ISO String
}

export type SavingsApplication = {
    id: string;
    userId: string;
    userName: string;
    schemeId: string;
    schemeName: string;
    initialDeposit: number;
    status: 'pending' | 'approved' | 'rejected';
    applicationDate: string; // ISO String
}

export type Transaction = {
    id: string;
    accountId: string; // Savings account ID
    accountNumber?: string;
    userId: string;
    userName?: string;
    type: 'credit' | 'debit';
    amount: number;
    description: string;
    date: string; // ISO string
    tellerId: string;
    tellerName?: string;
    status: 'completed' | 'pending' | 'failed';
    balanceBefore: number;
    balanceAfter: number;
};


// --- Accounting Schemas ---
export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export type ChartOfAccount = {
    id: string; // Document ID from Firestore
    name: string;
    type: AccountType;
    balance: number;
}

export type JournalEntryDetail = {
    accountId: string; // Corresponds to ChartOfAccount ID
    accountName?: string; // For display purposes
    debit: number;
    credit: number;
}

export type JournalEntry = {
    id: string; // Document ID from Firestore
    date: string; // ISO string
    description: string;
    entries: JournalEntryDetail[];
    relatedTransactionId?: string; // e.g., link back to a teller transaction
}


// --- Settings Schemas ---
export type Branch = {
    id: string;
    name: string;
    address: string;
}

export type Holiday = {
    id: string;
    date: string; // YYYY-MM-DD
    name: string;
    type: 'National' | 'Regional' | 'Cooperative';
}

export type SocietyConfig = {
    name: string;
    registrationNumber: string;
    address: string;
    kycRetentionYears: number;
    upiId?: string;
    // Account Number Series
    savingsPrefix?: string;
    savingsNextNumber?: number;
    loanPrefix?: string;
    loanNextNumber?: number;
    depositPrefix?: string;
    depositNextNumber?: number;
}

export type ComplianceSettings = {
    kycRetentionYears: number;
}


// --- Statement & Certificate Schemas ---
export type InterestCertificateData = {
    societyName: string;
    societyAddress: string;
    memberName: string;
    memberAddress: string;
    financialYear: string;
    totalInterest: number;
    accounts: {
        accountNumber: string;
        principal: number;
        rate: number;
        interestEarned: number;
    }[];
    generatedDate: string;
};

export type LoanClosureCertificateData = {
    societyName: string;
    societyAddress: string;
    memberName: string;
    memberAddress: string;
    loanAccountNumber: string;
    loanAmount: number;
    disbursalDate: string;
    isClosed: boolean;
    generatedDate: string;
}

// --- Support Ticket Schemas ---
export const TICKET_CATEGORIES = ['General Inquiry', 'Transaction Dispute', 'Loan Question', 'Deposit Question', 'KYC Update', 'Other'] as const;
export const TICKET_STATUSES = ['Open', 'In Progress', 'Resolved', 'Closed'] as const;

export type TicketCategory = (typeof TICKET_CATEGORIES)[number];
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export type TicketReply = {
    replyId: string;
    authorId: string;
    authorName: string;
    message: string;
    createdAt: string; // ISO string
};

export type SupportTicket = {
    id: string;
    userId: string;
    userName: string;
    category: TicketCategory;
    subject: string;
    message: string;
    status: TicketStatus;
    createdAt: string; // ISO string
    updatedAt: string; // ISO string
    replies: TicketReply[];
};
