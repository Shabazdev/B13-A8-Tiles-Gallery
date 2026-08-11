/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useTransition } from 'react';
import { Tile, AppRoute } from '../types';
import TileCard from './TileCard';
import { Search, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react';

interface AllTilesViewProps {
  tiles: Tile[];
  onViewDetails: (id: string) => void;
}

export default function AllTilesView({ tiles, onViewDetails }: AllTilesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isPending, startTransition] = useTransition();

  // Categories list derived dynamically plus 'all'
  const categories = ['all', ...Array.from(new Set(tiles.map((t) => t.category)))];

  const filteredTiles = tiles.filter((tile) => {
    const matchesSearch = tile.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || tile.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      
      {/* Page Title & Search Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-4">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">Catalogue</span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          The Full Gallery
        </h1>
        <p className="text-sm text-neutral-500 font-sans">
          Browse through our complete collection of handcrafted textures and colors. Use search or categories to find your perfect match.
        </p>

        {/* Large Hero Search input */}
        <div className="relative mt-6 max-w-lg mx-auto">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-neutral-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search tiles by title (e.g. Carrara, Cobalt, Glass)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-white py-3.5 pl-12 pr-4 text-sm text-neutral-900 placeholder-neutral-400 focus:border-neutral-950 focus:outline-none focus:ring-1 focus:ring-neutral-950 shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Filter Tabs & Options */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-6 mb-8">
        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all border ${
                selectedCategory === category
                  ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                  : 'bg-white border-neutral-200 text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Status specs */}
        <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
          <SlidersHorizontal size={14} className="text-neutral-400" />
          <span>Showing {filteredTiles.length} of {tiles.length} items</span>
        </div>
      </div>

      {/* Tiles Grid */}
      {filteredTiles.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTiles.map((tile) => (
            <TileCard key={tile.id} tile={tile} onViewDetails={onViewDetails} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
            <Search size={22} />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-neutral-900">No tiles found</h3>
          <p className="mt-1 text-xs text-neutral-500">
            No items matched your search "{searchTerm}" with the chosen filters.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCategory('all');
            }}
            className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-neutral-900 hover:underline"
          >
            Clear Search & Filters
          </button>
        </div>
      )}
    </div>
  );
}
