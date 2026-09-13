"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Tile } from '@/lib/types';
import { useToast } from '@/lib/toast-context';
import { ArrowLeft, Tag, ShoppingCart, Info, Compass, Box, Maximize } from 'lucide-react';

interface TileDetailsViewProps {
  tile: Tile;
}

export default function TileDetailsView({ tile }: TileDetailsViewProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const isOut = !tile.inStock;

  const handleAddToCart = () => {
    showToast(`Studio sample ordered for "${tile.title}"! Check your email.`, 'success');
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Button */}
      <button
        onClick={() => router.push('/all-tiles')}
        className="group inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors mb-8"
      >
        <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
        Back to Gallery
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Image Preview */}
        <div className="lg:col-span-6 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-lg aspect-[4/3] sm:aspect-square"
          >
            <img
              src={tile.image}
              alt={tile.title}
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover object-center"
            />
            {/* Category badge */}
            <span className="absolute top-4 left-4 rounded-full bg-white/90 backdrop-blur-md px-3 py-1 text-xs font-bold uppercase tracking-widest text-neutral-800 shadow-sm border border-neutral-100">
              {tile.category}
            </span>
            {isOut && (
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
                <span className="rounded-xl bg-rose-600 px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-xl">
                  Currently Out of Stock
                </span>
              </div>
            )}
          </motion.div>

          {/* Secondary Details/Mock Texture indicators to show high craftsmanship */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
              <Compass size={16} className="mx-auto text-neutral-400 mb-1" />
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Finish</p>
              <p className="text-xs font-semibold text-neutral-800 mt-0.5">Polished / Gloss</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
              <Box size={16} className="mx-auto text-neutral-400 mb-1" />
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Coverage</p>
              <p className="text-xs font-semibold text-neutral-800 mt-0.5">Per Box (1.44m²)</p>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-3 text-center">
              <Maximize size={16} className="mx-auto text-neutral-400 mb-1" />
              <p className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Weight</p>
              <p className="text-xs font-semibold text-neutral-800 mt-0.5">~22 kg/box</p>
            </div>
          </div>
        </div>


        {/* Right Column: Descriptions & Info */}
        <div className="lg:col-span-6 space-y-6 text-left">
          {/* Header Specs */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold font-mono text-neutral-400 uppercase tracking-widest">
                Artisan Series
              </span>
              <span className="text-neutral-300">•</span>
              <span className="text-xs font-semibold font-mono text-neutral-500 uppercase">
                Creator: {tile.creator}
              </span>
            </div>
            <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
              {tile.title}
            </h1>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-neutral-900">
                ${tile.price.toFixed(2)}
              </span>
              <span className="text-xs text-neutral-400 uppercase font-mono">{tile.currency} per square meter</span>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Aesthetic Concept</h3>
            <p className="text-sm text-neutral-600 leading-relaxed font-sans">
              {tile.description}
            </p>
          </div>

          {/* Technical Specs Table */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Technical Blueprint</h3>
            <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden divide-y divide-neutral-100">
              <div className="flex justify-between items-center px-4 py-3 text-xs">
                <span className="text-neutral-500 font-medium">Material Composition</span>
                <span className="font-semibold text-neutral-900">{tile.material}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 text-xs">
                <span className="text-neutral-500 font-medium">Physical Dimensions</span>
                <span className="font-semibold text-neutral-900">{tile.dimensions}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 text-xs">
                <span className="text-neutral-500 font-medium">Architectural Creator</span>
                <span className="font-semibold text-neutral-900">{tile.creator}</span>
              </div>
              <div className="flex justify-between items-center px-4 py-3 text-xs">
                <span className="text-neutral-500 font-medium">Availability</span>
                <span className={`font-semibold ${tile.inStock ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {tile.inStock ? 'Ready for Dispatch' : 'Awaiting Production'}
                </span>
              </div>
            </div>
          </div>

          {/* Style Tags */}
          <div className="space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-widest text-neutral-400">Gallery Tags</h3>
            <div className="flex flex-wrap gap-2">
              {tile.tags.map((tag) => (
                <div
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 border border-neutral-200"
                >
                  <Tag size={11} className="text-neutral-400" />
                  {tag}
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="rounded-2xl bg-neutral-900 p-6 text-white space-y-4 shadow-xl">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-neutral-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-neutral-300 leading-normal">
                Want to evaluate the finish before committing? Order an elegant studio sample swatch shipped directly to your design desk.
              </p>
            </div>
            <div className="flex gap-4">
              <button
                disabled={isOut}
                onClick={handleAddToCart}
                id="btn-order-sample"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-xs font-bold text-neutral-900 shadow transition-all hover:bg-neutral-100 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart size={14} />
                {isOut ? 'Sold Out' : 'Request Studio Sample'}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

