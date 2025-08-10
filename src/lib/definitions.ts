export const ROLES = ['admin', 'branch_manager', 'treasurer', 'accountant', 'teller', 'auditor', 'member'] as const;
export type Role = (typeof ROLES)[number];

export type UserSession = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  role: Role;
};
