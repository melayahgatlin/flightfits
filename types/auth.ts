export type AuthMode = 'authenticated' | 'guest' | 'signed-out';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StoredAccount extends AuthUser {
  password: string;
}

export interface AuthSession {
  mode: AuthMode;
  user: AuthUser | null;
}

export interface SignUpInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
