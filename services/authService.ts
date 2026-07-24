import AsyncStorage from '@react-native-async-storage/async-storage';

import type {
  AuthSession,
  AuthUser,
  LoginInput,
  SignUpInput,
  StoredAccount,
} from '@/types/auth';

const ACCOUNT_KEY = '@flightfits/auth/account';
const SESSION_KEY = '@flightfits/auth/session';

const SIGNED_OUT_SESSION: AuthSession = {
  mode: 'signed-out',
  user: null,
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function toPublicUser(account: StoredAccount): AuthUser {
  const { password: _password, ...user } = account;
  return user;
}

export async function getStoredSession(): Promise<AuthSession> {
  const value = await AsyncStorage.getItem(SESSION_KEY);

  if (!value) {
    return SIGNED_OUT_SESSION;
  }

  try {
    return JSON.parse(value) as AuthSession;
  } catch {
    await AsyncStorage.removeItem(SESSION_KEY);
    return SIGNED_OUT_SESSION;
  }
}

export async function signUp(input: SignUpInput): Promise<AuthSession> {
  const existingValue = await AsyncStorage.getItem(ACCOUNT_KEY);
  const normalizedEmail = normalizeEmail(input.email);

  if (existingValue) {
    const existing = JSON.parse(existingValue) as StoredAccount;
    if (normalizeEmail(existing.email) === normalizedEmail) {
      throw new Error('An account with this email already exists.');
    }
  }

  const account: StoredAccount = {
    id: `local-${Date.now()}`,
    name: input.name.trim(),
    email: normalizedEmail,
    password: input.password,
    createdAt: new Date().toISOString(),
  };

  const session: AuthSession = {
    mode: 'authenticated',
    user: toPublicUser(account),
  };

  await AsyncStorage.multiSet([
    [ACCOUNT_KEY, JSON.stringify(account)],
    [SESSION_KEY, JSON.stringify(session)],
  ]);

  return session;
}

export async function login(input: LoginInput): Promise<AuthSession> {
  const value = await AsyncStorage.getItem(ACCOUNT_KEY);

  if (!value) {
    throw new Error('No local account was found. Create an account first.');
  }

  const account = JSON.parse(value) as StoredAccount;
  const emailMatches = normalizeEmail(account.email) === normalizeEmail(input.email);
  const passwordMatches = account.password === input.password;

  if (!emailMatches || !passwordMatches) {
    throw new Error('The email or password is incorrect.');
  }

  const session: AuthSession = {
    mode: 'authenticated',
    user: toPublicUser(account),
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function continueAsGuest(): Promise<AuthSession> {
  const session: AuthSession = {
    mode: 'guest',
    user: null,
  };

  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export async function logout(): Promise<AuthSession> {
  await AsyncStorage.removeItem(SESSION_KEY);
  return SIGNED_OUT_SESSION;
}

export async function requestPasswordReset(email: string): Promise<void> {
  const value = await AsyncStorage.getItem(ACCOUNT_KEY);

  if (!value) {
    return;
  }

  const account = JSON.parse(value) as StoredAccount;

  if (normalizeEmail(account.email) !== normalizeEmail(email)) {
    return;
  }

  // Phase 7 uses local authentication only. Supabase will send the actual
  // password reset email when Phase 8 is connected.
}
