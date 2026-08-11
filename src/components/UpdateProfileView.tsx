/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { AppRoute, User } from '../types';
import { User as UserIcon, Image as ImageIcon, Save, ArrowLeft, RefreshCw, ShieldAlert } from 'lucide-react';

interface UpdateProfileViewProps {
  currentUser: User | null;
  onNavigate: (route: AppRoute) => void;
  onUpdateSuccess: (updatedUser: User, message: string) => void;
}

export default function UpdateProfileView({ currentUser, onNavigate, onUpdateSuccess }: UpdateProfileViewProps) {
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setPhotoUrl(currentUser.photoUrl);
    }
  }, [currentUser]);

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-neutral-500">Please login to access profile updates.</p>
      </div>
    );
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name field cannot be left blank.');
      return;
    }

    // Prepare updated user object
    const updatedUser: User = {
      ...currentUser,
      name: name.trim(),
      photoUrl: photoUrl.trim(),
    };

    // Update in our mock localStorage database if not a guest Google user
    const usersRaw = localStorage.getItem('tesserae_users');
    if (usersRaw) {
      const users: Array<User & { password?: string }> = JSON.parse(usersRaw);
      const userIndex = users.findIndex(u => u.id === currentUser.id);
      if (userIndex !== -1) {
        users[userIndex].name = name.trim();
        users[userIndex].photoUrl = photoUrl.trim();
        localStorage.setItem('tesserae_users', JSON.stringify(users));
      }
    }

    onUpdateSuccess(updatedUser, 'Your designer profile details have been updated successfully!');
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="space-y-6">
        
        {/* Back Button */}
        <button
          onClick={() => onNavigate({ name: 'my-profile' })}
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
                className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow hover:bg-neutral-800 transition-all active:scale-98"
              >
                <Save size={14} />
                Update Information
              </button>
            </div>
          </form>

        </div>

      </div>
    </div>
  );
}
