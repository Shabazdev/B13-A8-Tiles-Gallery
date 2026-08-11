/**
 * AuthContext — Real Firebase Authentication Context
 * Provides login, register, Google OAuth, logout, and live auth state.
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  User as FirebaseUser,
} from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { auth, googleProvider } from '../firebase';
import { User } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthContextValue {
  currentUser: User | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string, photoUrl?: string) => Promise<void>;
  loginWithGoogle: () => Promise<User>;
  logout: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a Firebase User object to the app's User type */
function toAppUser(firebaseUser: FirebaseUser): User {
  return {
    id: firebaseUser.uid,
    name: firebaseUser.displayName ?? 'User',
    email: firebaseUser.email ?? '',
    photoUrl: firebaseUser.photoURL ?? '',
    isGoogleUser: firebaseUser.providerData.some(
      (p) => p.providerId === 'google.com'
    ),
  };
}

/** Convert Firebase error codes to human-readable messages */
export function parseFirebaseError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-not-found':
      case 'auth/invalid-credential':
        return 'No account found with this email or incorrect password.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists. Please log in instead.';
      case 'auth/weak-password':
        return 'Password must be at least 6 characters long.';
      case 'auth/popup-closed-by-user':
        return 'Google sign-in was cancelled. Please try again.';
      case 'auth/popup-blocked':
        return 'Popup was blocked by your browser. Please allow popups for this site.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection.';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }
  return 'An unexpected error occurred. Please try again.';
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true); // true until Firebase resolves initial state

  // Subscribe to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setCurrentUser(toAppUser(firebaseUser));
      } else {
        setCurrentUser(null);
      }
      setAuthLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  // Email + Password login
  const login = async (email: string, password: string): Promise<User> => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return toAppUser(result.user);
  };

  // Email + Password registration
  const register = async (
    name: string,
    email: string,
    password: string,
    photoUrl?: string
  ): Promise<void> => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    // Set display name (and optional photo URL) on the Firebase profile
    await updateProfile(result.user, {
      displayName: name,
      photoURL: photoUrl?.trim() || null,
    });
    // Sign out immediately so they are redirected to login page to sign in
    await signOut(auth);
  };

  // Google OAuth popup
  const loginWithGoogle = async (): Promise<User> => {
    const result = await signInWithPopup(auth, googleProvider);
    return toAppUser(result.user);
  };

  // Logout
  const logout = async (): Promise<void> => {
    await signOut(auth);
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
    throw new Error('useAuth must be used inside <AuthProvider>');
  }
  return ctx;
}
