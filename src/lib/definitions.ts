export type UserSession = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
  isAdmin: boolean;
};
