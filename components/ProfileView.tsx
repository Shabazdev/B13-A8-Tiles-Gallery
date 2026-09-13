"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import { User } from '@/lib/types';
import { User as UserIcon, Mail, Calendar, Edit, ExternalLink, Shield, Grid } from 'lucide-react';

interface ProfileViewProps {
  currentUser: User | null;
}

export default function ProfileView({ currentUser }: ProfileViewProps) {
  const router = useRouter();

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <p className="text-sm text-neutral-500">Please login to view your profile.</p>
      </div>
    );
  }

  // Simulated join date
  const joinDate = currentUser.isGoogleUser ? 'Google Sync' : 'July 2026';

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="space-y-6">
        {/* Header Title */}
        <div className="text-left space-y-1">
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">Settings</span>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900">
            My Designer Profile
          </h1>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans">
            Manage your credentials, custom design aesthetic parameters, and display options.
          </p>
        </div>

        {/* Profile Card */}
        <div className="rounded-2xl border border-neutral-200 bg-white overflow-hidden shadow-lg text-left">
          {/* Cover bar */}
          <div className="h-28 bg-[linear-gradient(45deg,#1c1917_0%,#44403c_100%)] relative">
            <span className="absolute top-4 right-4 rounded-full bg-white/25 backdrop-blur-md px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest text-white border border-white/20">
              {currentUser.isGoogleUser ? 'OAUTH SYNCED' : 'STANDARD DESIGNER'}
            </span>
          </div>

          {/* Profile details */}
          <div className="px-6 pb-6 relative">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-full border-4 border-white overflow-hidden bg-neutral-100 shadow-md absolute -top-10 left-6">
              {currentUser.photoUrl ? (
                <img
                  src={currentUser.photoUrl}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-neutral-500">
                  <UserIcon size={32} />
                </div>
              )}
            </div>

            {/* Title Block */}
            <div className="pt-12 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 font-sans">{currentUser.name}</h2>
                <p className="text-xs text-neutral-500 mt-0.5">{currentUser.email}</p>
              </div>

              {/* Update Info Route CTA Button */}
              <button
                onClick={() => router.push('/update-profile')}
                id="btn-edit-profile-view"
                className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-50 hover:text-neutral-900"
              >
                <Edit size={13} />
                Update Information
              </button>
            </div>

            <hr className="border-neutral-100 my-6" />

            {/* Profile specifications */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 text-neutral-600">
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
                  <Mail size={15} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Email Address</p>
                  <p className="text-xs font-medium text-neutral-800">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-600">
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
                  <Calendar size={15} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Member Since</p>
                  <p className="text-xs font-medium text-neutral-800">{joinDate}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-600">
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
                  <Shield size={15} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Security Access</p>
                  <p className="text-xs font-medium text-neutral-800">Verified Client</p>
                </div>
              </div>

              <div className="flex items-center gap-3 text-neutral-600">
                <div className="p-2 rounded-lg bg-neutral-100 text-neutral-800">
                  <Grid size={15} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Preferred Layout</p>
                  <p className="text-xs font-medium text-neutral-800">Architectural Bento Grid</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Dynamic empty state layout helper to prevent boring pages */}
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-stone-50 p-6 text-left">
          <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
            <ExternalLink size={13} />
            Quick Shortcuts
          </h3>
          <p className="text-xs text-neutral-500 leading-relaxed font-sans mb-4">
            Use these quick links to navigate around the boutique tiles showroom seamlessly.
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-white border border-neutral-200 hover:border-neutral-900 hover:text-neutral-900 transition-colors px-3 py-1.5 text-xs text-neutral-600 font-bold"
            >
              Go to Home Page
            </button>
            <button
              onClick={() => router.push('/all-tiles')}
              className="rounded-lg bg-white border border-neutral-200 hover:border-neutral-900 hover:text-neutral-900 transition-colors px-3 py-1.5 text-xs text-neutral-600 font-bold"
            >
              Explore Full Gallery
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

