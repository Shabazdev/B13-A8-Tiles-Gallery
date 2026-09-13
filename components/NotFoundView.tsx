"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import { Home, ArrowLeft, Construction } from 'lucide-react';

export default function NotFoundView() {
  const router = useRouter();

  return (
    <div className="mx-auto max-w-md px-4 py-20 text-center space-y-6">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-800 border border-neutral-200 shadow-sm animate-pulse">
        <Construction size={28} strokeWidth={1.5} />
      </div>
      
      <div className="space-y-2">
        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-neutral-900">404</h1>
        <h2 className="text-lg font-bold text-neutral-800 font-serif">Misplaced Tile</h2>
        <p className="text-xs text-neutral-500 leading-relaxed font-sans max-w-sm mx-auto">
          The architectural grid coordinates you requested do not exist in this gallery layout. It might have been relocated to another exhibit.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
        <button
          onClick={() => router.push('/')}
          className="flex items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-5 py-3 text-xs font-bold text-white shadow transition-all hover:bg-neutral-800"
        >
          <Home size={13} />
          Return to Home
        </button>
        <button
          onClick={() => router.push('/all-tiles')}
          className="flex items-center justify-center gap-1.5 rounded-xl border border-neutral-200 bg-white px-5 py-3 text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-50"
        >
          <ArrowLeft size={13} />
          Explore Gallery
        </button>
      </div>
    </div>
  );
}
