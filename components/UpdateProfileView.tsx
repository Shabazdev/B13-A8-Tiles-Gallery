"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, parseAuthError } from '@/lib/auth-context';
import { useToast } from '@/lib/toast-context';
import { authClient } from '@/lib/auth-client';
import { User as UserIcon, Image as ImageIcon, Save, ArrowLeft, RefreshCw, ShieldAlert, Loader2 } from 'lucide-react';

export default function UpdateProfileView() {
  const router = useRouter();
  const { showToast } = useToast();
  const { currentUser, authLoading } = useAuth();

  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhotoUrl(currentUser.photoUrl);
    }
  }, [currentUser]);

  if (authLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-neutral-500">Checking your session…</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-neutral-500">Please login to access profile updates.</p>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name field cannot be left blank.');
      return;
    }

    setIsSubmitting(true);

    // Persist updates through Better Auth (replaces the old localStorage mock)
    const { error: updateError } = await authClient.updateUser({
      name: name.trim(),
      image: photoUrl.trim() || null,
    });

    if (updateError) {
      setError(parseAuthError(updateError));
      setIsSubmitting(false);
      return;
    }

    showToast('Your designer profile details have been updated successfully!', 'success');
    router.push('/my-profile');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => router.push('/my-profile')}
          className="group inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Cancel and Return
        </button>

        {/* Update Form Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-xl text-left space-y-6">
          <div className="space-y-1.5 text-center">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-neutral-100 text-neutral-900 mb-2 animate-spin-slow">
              <RefreshCw size={18} />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-neutral-900 font-sans" id="update-profile-title">
              Update Information
            </h2>
            <p className="text-xs text-neutral-500">
              Change your display name and photo link instantly.
            </p>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-xs text-rose-600">
              <ShieldAlert size={15} className="mt-0.5 flex-shrink-0 text-rose-500" />
              <p className="font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Display Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Display Name</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <UserIcon size={15} />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            {/* Input 2: Image URL */}
            <div className="space-y-1">
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Image / Photo URL</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-neutral-400">
                  <ImageIcon size={15} />
                </span>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  className="w-full rounded-xl border border-neutral-200 py-2.5 pl-10 pr-4 text-xs text-neutral-900 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                id="btn-update-info-submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow hover:bg-neutral-800 transition-all active:scale-98 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Saving changes…
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    Update Information
                  </>
                )}
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}

