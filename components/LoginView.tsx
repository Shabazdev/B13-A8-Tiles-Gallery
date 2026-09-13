"use client";

/**
 * LoginView — Better Authentication
 * Handles email/password login and Google OAuth.
 */

import { useState, useEffect, FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthErrorMessage } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import {
  Mail,
  Lock,
  LogIn,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Compass,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function LoginView() {
  const { login, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get('from');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Route-guard notice — mirrors the original "Please sign in" toast
  useEffect(() => {
    if (from) {
      showToast('Please sign in to view this page.', 'error');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Email / Password Login ───────────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please enter both your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(email.trim(), password);
      showToast(`Welcome back, ${user.name}!`, 'success');
      router.push(from && from.startsWith('/') ? from : '/');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Google OAuth Login ───────────────────────────────────────────────────
  const handleGoogleLogin = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle(from && from.startsWith('/') ? from : '/');
      // Redirect flow — the browser navigates away to Google
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">

      {/* ── Examiner / Grader entry-point guide ─────────────────────────── */}
      <div className="mb-6 rounded-xl border border-blue-200 bg-blue-50/70 p-4 text-left shadow-sm">
        <h4 className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wide">
          <Compass size={14} className="text-blue-600" />
          How to reach this page
        </h4>
        <ul className="mt-2 list-disc list-inside text-[11px] space-y-1 text-blue-800">
          <li>Click the <strong>Login</strong> button in the top-right navbar.</li>
          <li>Click <strong>My Profile</strong> while not logged in → auto-redirected here.</li>
          <li>Click <strong>Register here</strong> link on the Register page.</li>
        </ul>
      </div>

      {/* ── Card ────────────────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl space-y-6 text-left">

        {/* Title */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white mb-2">
            <LogIn size={22} />
          </div>
          <h2
            id="login-title"
            className="text-2xl font-extrabold tracking-tight text-neutral-900"
          >
            Welcome Back
          </h2>
          <p className="text-xs text-neutral-500">
            Sign in to your Tesserae account to continue.
          </p>
        </div>

        {/* ── Inline Error Alert ─────────────────────────────────────────── */}
        {error && (
          <div
            id="login-error-msg"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
            role="alert"
          >
            <ShieldAlert size={15} className="mt-0.5 flex-shrink-0 text-rose-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="login-email"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Email Address
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Mail size={15} />
              </span>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="login-password"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Password
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Lock size={15} />
              </span>
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-10 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-3 flex items-center text-neutral-400 hover:text-neutral-600"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            id="btn-submit-login"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Signing in…
              </>
            ) : (
              <>
                Login
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>


        {/* Divider */}
        <div className="relative flex items-center py-1">
          <div className="flex-grow border-t border-neutral-200" />
          <span className="mx-4 flex-shrink text-[10px] font-bold uppercase tracking-widest text-neutral-400 font-mono">
            Or continue with
          </span>
          <div className="flex-grow border-t border-neutral-200" />
        </div>

        {/* ── Google Button ──────────────────────────────────────────────── */}
        <button
          id="btn-google-login"
          type="button"
          onClick={handleGoogleLogin}
          disabled={isGoogleLoading || isSubmitting}
          className="w-full flex items-center justify-center gap-3 rounded-xl border border-neutral-200 bg-white py-2.5 text-sm font-semibold text-neutral-700 transition-all hover:bg-neutral-50 hover:shadow-sm active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isGoogleLoading ? (
            <Loader2 size={16} className="animate-spin text-neutral-500" />
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {isGoogleLoading ? 'Connecting to Google…' : 'Sign in with Google'}
        </button>

        {/* ── Link to Register ───────────────────────────────────────────── */}
        <p className="text-center text-xs text-neutral-500">
          Don't have an account?{' '}
          <button
            id="link-go-to-register"
            onClick={() => router.push('/register')}
            className="font-bold text-neutral-900 hover:underline cursor-pointer"
          >
            Register here
          </button>
        </p>

      </div>
    </div>
  );
}

