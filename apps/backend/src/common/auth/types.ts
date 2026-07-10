export type AuthenticatedUser = {
  id: string;
  username: string;
  roles: string[];
  permissions: string[];
};
