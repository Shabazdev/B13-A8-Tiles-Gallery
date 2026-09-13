"use client";

/**
 * AuthContext — Better Auth Authentication Context
 * Provides login, register, Google OAuth, logout, and live session state.
 * Replaces the old Firebase AuthContext with an identical public API so the
 * existing UI components keep working unchanged.
 */

import { createContext, useContext, ReactNode } from "react";
import { authClient } from "./auth-client";
import { User } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, photoUrl?: string) => Promise<void>;
  loginWithGoogle: (callbackURL?: string) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthErrorShape {
  code?: string | null;
  message?: string | null;
  status?: number;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a Better Auth session user into the app's User type */
function toAppUser(user: { id: string; name: string; email: string; image?: string | null }): User {
  return {
    id: user.id,
    name: user.name || "User",
    email: user.email ?? "",
    photoUrl: user.image ?? "",
    isGoogleUser: false,
  };
}

/** Convert Better Auth error codes to human-readable messages */
export function parseAuthError(error: AuthErrorShape | null | undefined): string {
  if (!error) {
    return "An unexpected error occurred. Please try again.";
  }
  switch (error.code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "USER_NOT_FOUND":
    case "USER_EMAIL_NOT_FOUND":
    case "CREDENTIAL_ACCOUNT_NOT_FOUND":
      return "No account found with this email or incorrect password.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists. Please log in instead.";
    case "PASSWORD_TOO_SHORT":
      return "Password must be at least 6 characters long.";
    case "INVALID_EMAIL":
      return "The email address is not valid.";
    case "FAILED_TO_CREATE_USER":
    case "FAILED_TO_CREATE_SESSION":
      return "We could not process your request right now. Please try again.";
    case "SOCIAL_PROVIDER_MISSING":
    case "PROVIDER_DISABLED":
      return "Google sign-in is not configured on the server yet.";
    default:
      return error.message || "An unexpected error occurred. Please try again.";
  }
}

/** Extract a friendly message from a thrown value */
export function getAuthErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  return "An unexpected error occurred. Please try again.";
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending: authLoading } = authClient.useSession();

  const currentUser = sessionData?.user ? toAppUser(sessionData.user) : null;

  // Email + Password login
  const login = async (email: string, password: string): Promise<User> => {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error || !data) {
      throw new Error(parseAuthError(error));
    }
    return toAppUser(data.user);
  };

  // Email + Password registration
  const register = async (
    name: string,
    email: string,
    password: string,
    photoUrl?: string
  ): Promise<void> => {
    const { error } = await authClient.signUp.email({
      name,
      email,
      password,
      image: photoUrl?.trim() || undefined,
    });
    if (error) {
      throw new Error(parseAuthError(error));
    }
    // Preserve original behaviour: sign out immediately so the user is
    // redirected to the login page to sign in with their new credentials.
    await authClient.signOut();
  };

  // Google OAuth (redirect flow)
  const loginWithGoogle = async (callbackURL: string = "/"): Promise<void> => {
    const { error } = await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
    if (error) {
      throw new Error(parseAuthError(error));
    }
  };

  // Logout
  const logout = async (): Promise<void> => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, authLoading, login, register, loginWithGoogle, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
