"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Tile } from '@/lib/types';
import TileCard from './TileCard';
import Marquee from './Marquee';
import { ArrowRight, Compass, ShieldCheck, Sparkles, Award } from 'lucide-react';

interface HomeViewProps {
  featuredTiles: Tile[];
}

export default function HomeView({ featuredTiles }: HomeViewProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col bg-stone-50/50">
      
      {/* 1. Hero Banner Section */}
      <section className="relative overflow-hidden border-b border-neutral-200 bg-white py-16 sm:py-24">
        {/* Subtle geometric grid background pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px]" />
        
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy & CTA */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-800 border border-neutral-200"
              >
                <Sparkles size={12} className="text-neutral-950 animate-pulse" />
                The Fine Art of Architectural Ceramics
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-sans text-4xl font-extrabold tracking-tight text-neutral-900 sm:text-5xl lg:text-6xl"
              >
                Discover Your <span className="font-serif italic font-normal text-neutral-700">Perfect Aesthetic</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="max-w-xl text-sm sm:text-base text-neutral-500 leading-relaxed font-sans"
              >
                Explore Tesserae, a digital gallery showcasing meticulously crafted tiles, custom glass mosaics, Italian marbles, and handcrafted terracotta designed to turn ordinary walls into canvas.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 pt-2"
              >
                <button
                  onClick={() => router.push('/all-tiles')}
                  id="btn-browse-hero"
                  className="group flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3.5 text-xs font-bold text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-neutral-800 hover:shadow-neutral-900/20"
                >
                  Browse Now
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => {
                    const el = document.getElementById('featured-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="rounded-xl border border-neutral-200 bg-white px-6 py-3.5 text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-50"
                >
                  View Featured
                </button>
              </motion.div>
            </div>

            {/* Right Column: Premium Visual Showcase */}
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative aspect-square sm:aspect-[4/3] lg:aspect-square w-full overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-100 shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80"
                  alt="Modern tile interior showcase"
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/40 via-transparent to-transparent" />
                
                {/* Embedded floating card */}
                <div className="absolute bottom-4 left-4 right-4 rounded-xl bg-white/95 backdrop-blur-md p-4 shadow-lg border border-neutral-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-widest text-neutral-400">In-situ Spotlight</p>
                    <p className="text-xs font-bold text-neutral-900 font-serif mt-0.5">Atelier Carrara Luxe Setup</p>
                  </div>
                  <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[10px] font-semibold text-white">
                    Room View
                  </span>
                </div>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Scrolling Marquee Section */}
      <Marquee />

      {/* 3. Value Props Grid */}
      <section className="bg-white py-12 border-b border-neutral-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 flex-shrink-0">
                <Compass size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Curated Architecture</h4>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">Every piece selected by design experts to elevate spatial depth.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 flex-shrink-0">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Certified Authentic</h4>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">Direct sourcing guarantees real Tuscan clay and Italian quarries.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-800 flex-shrink-0">
                <Award size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900">Custom Dimensions</h4>
                <p className="mt-1 text-xs text-neutral-500 leading-relaxed">Precision cutting to fit bespoke spatial outlines and blueprints.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Featured Tiles Section */}
      <section id="featured-section" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-baseline justify-between gap-4 mb-8">
          <div>
            <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">Handpicked</span>
            <h2 className="mt-1 font-sans text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl">
              Artisan Showcase
            </h2>
          </div>
          <button
            onClick={() => router.push('/all-tiles')}
            className="group flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-neutral-950 transition-colors"
          >
            Explore all tiles
            <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {/* Tiles Grid (Exactly top 4) */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredTiles.map((tile) => (
            <TileCard
              key={tile.id}
              tile={tile}
              onViewDetails={(id) => router.push(`/tile/${id}`)}
            />
          ))}
        </div>
      </section>

    </div>
  );
}

