"use client";

/**
 * RegisterView — Better Authentication
 * Handles email/password registration and Google OAuth.
 * On email/password success → navigates to Login page.
 * On Google success → logs in and navigates to Home page.
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, getAuthErrorMessage } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import {
  User as UserIcon,
  Mail,
  Lock,
  Image,
  UserPlus,
  ArrowRight,
  Loader2,
  ShieldAlert,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function RegisterView() {
  const { register, loginWithGoogle } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // ── Email / Password Registration ────────────────────────────────────────
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Name, Email, and Password are all required.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register(name.trim(), email.trim(), password, photoUrl.trim() || undefined);
      showToast('Account created! Please sign in with your new credentials.', 'success');
      router.push('/login');
    } catch (err) {
      setError(getAuthErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Google OAuth — registers AND logs in immediately ─────────────────────
  const handleGoogleSignup = async () => {
    setError('');
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle('/');
      // Google signup also logs the user in → redirect flow takes over
    } catch (err) {
      setError(getAuthErrorMessage(err));
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl space-y-6 text-left">

        {/* Title */}
        <div className="space-y-1.5 text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-neutral-900 text-white mb-2">
            <UserPlus size={22} />
          </div>
          <h2
            id="register-title"
            className="text-2xl font-extrabold tracking-tight text-neutral-900"
          >
            Create Account
          </h2>
          <p className="text-xs text-neutral-500">
            Join Tesserae and explore our curated tile gallery.
          </p>
        </div>

        {/* ── Inline Error Alert ─────────────────────────────────────────── */}
        {error && (
          <div
            id="register-error-msg"
            className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700"
            role="alert"
          >
            <ShieldAlert size={15} className="mt-0.5 flex-shrink-0 text-rose-500" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* ── Form ──────────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>

          {/* Name */}
          <div className="space-y-1">
            <label
              htmlFor="register-name"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Full Name *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <UserIcon size={15} />
              </span>
              <input
                id="register-name"
                type="text"
                required
                autoComplete="name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label
              htmlFor="register-email"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Email Address *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Mail size={15} />
              </span>
              <input
                id="register-email"
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

          {/* Photo URL */}
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label
                htmlFor="register-photo-url"
                className="text-xs font-bold uppercase tracking-wider text-neutral-500"
              >
                Photo URL
              </label>
              <span className="text-[10px] text-neutral-400 font-medium">Optional</span>
            </div>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Image size={15} />
              </span>
              <input
                id="register-photo-url"
                type="url"
                autoComplete="off"
                placeholder="https://example.com/photo.jpg"
                value={photoUrl}
                onChange={(e) => setPhotoUrl(e.target.value)}
                disabled={isSubmitting}
                className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-60"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label
              htmlFor="register-password"
              className="text-xs font-bold uppercase tracking-wider text-neutral-500"
            >
              Password *
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                <Lock size={15} />
              </span>
              <input
                id="register-password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                placeholder="At least 6 characters"
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

          {/* Register Button */}
          <button
            type="submit"
            id="btn-submit-register"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-neutral-900 py-3 text-sm font-bold text-white shadow-md hover:bg-neutral-800 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Creating account…
              </>
            ) : (
              <>
                Register
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
          id="btn-google-register"
          type="button"
          onClick={handleGoogleSignup}
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
          {isGoogleLoading ? 'Connecting to Google…' : 'Sign up with Google'}
        </button>

        {/* ── Link to Login ──────────────────────────────────────────────── */}
        <p className="text-center text-xs text-neutral-500">
          Already have an account?{' '}
          <button
            id="link-go-to-login"
            onClick={() => router.push('/login')}
            className="font-bold text-neutral-900 hover:underline cursor-pointer"
          >
            Sign in here
          </button>
        </p>

      </div>
    </div>
  );
}

