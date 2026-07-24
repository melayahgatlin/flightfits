import {
  createContext,
  type PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  continueAsGuest as continueAsGuestService,
  getStoredSession,
  login as loginService,
  logout as logoutService,
  requestPasswordReset,
  signUp as signUpService,
} from '@/services/authService';
import type {
  AuthSession,
  LoginInput,
  SignUpInput,
} from '@/types/auth';

interface AuthContextValue extends AuthSession {
  loading: boolean;
  isGuest: boolean;
  isAuthenticated: boolean;
  login: (input: LoginInput) => Promise<void>;
  signUp: (input: SignUpInput) => Promise<void>;
  continueAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

const INITIAL_SESSION: AuthSession = {
  mode: 'signed-out',
  user: null,
};

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<AuthSession>(INITIAL_SESSION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getStoredSession()
      .then((storedSession) => {
        if (active) {
          setSession(storedSession);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    setSession(await loginService(input));
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    setSession(await signUpService(input));
  }, []);

  const continueAsGuest = useCallback(async () => {
    setSession(await continueAsGuestService());
  }, []);

  const logout = useCallback(async () => {
    setSession(await logoutService());
  }, []);

  const forgotPassword = useCallback(async (email: string) => {
    await requestPasswordReset(email);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...session,
      loading,
      isGuest: session.mode === 'guest',
      isAuthenticated: session.mode === 'authenticated',
      login,
      signUp,
      continueAsGuest,
      logout,
      forgotPassword,
    }),
    [session, loading, login, signUp, continueAsGuest, logout, forgotPassword],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
