/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Tile } from '../types';
import { Sparkles, Eye, ArrowUpRight } from 'lucide-react';

interface TileCardProps {
  key?: string | number;
  tile: Tile;
  onViewDetails: (id: string) => void;
}

export default function TileCard({ tile, onViewDetails }: TileCardProps) {
  const isOut = !tile.inStock;

  return (
    <motion.div
      whileHover={{ y: -6 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-xl border border-neutral-200 bg-white transition-all hover:shadow-lg"
    >
      {/* Thumbnail */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-100">
        <img
          src={tile.image}
          alt={tile.title}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Category Badge */}
        <span className="absolute top-3 left-3 rounded-full bg-white/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-neutral-800 shadow-sm border border-neutral-100">
          {tile.category}
        </span>

        {/* Stock Badge */}
        {isOut && (
          <span className="absolute top-3 right-3 rounded-full bg-rose-500/90 backdrop-blur-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">
            Sold Out
          </span>
        )}

        {/* Overlay Hover Effect */}
        <div className="absolute inset-0 bg-neutral-900/10 opacity-0 transition-opacity group-hover:opacity-100 flex items-center justify-center">
          <button
            onClick={() => onViewDetails(tile.id)}
            className="flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:bg-neutral-800"
          >
            <Eye size={13} />
            Quick View
          </button>
        </div>
      </div>

      {/* Description Content */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-2">
          <h3 
            onClick={() => onViewDetails(tile.id)}
            className="font-sans text-sm font-semibold text-neutral-900 line-clamp-1 group-hover:text-neutral-700 cursor-pointer"
          >
            {tile.title}
          </h3>
          <span className="font-mono text-xs font-bold text-neutral-900 flex-shrink-0">
            ${tile.price.toFixed(2)}
          </span>
        </div>

        <p className="mt-1.5 text-xs text-neutral-500 line-clamp-2 leading-relaxed">
          {tile.description}
        </p>

        {/* Material Specs */}
        <div className="mt-4 flex flex-wrap items-center gap-1.5 pt-3 border-t border-neutral-100">
          <span className="text-[10px] text-neutral-400 font-mono">Mat: {tile.material}</span>
          <span className="text-neutral-300">•</span>
          <span className="text-[10px] text-neutral-400 font-mono">Dim: {tile.dimensions}</span>
        </div>

        {/* View Details CTA */}
        <div className="mt-4">
          <button
            onClick={() => onViewDetails(tile.id)}
            id={`btn-view-${tile.id}`}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-neutral-200 py-2 text-xs font-bold text-neutral-700 transition-all hover:bg-neutral-900 hover:text-white hover:border-neutral-900"
          >
            Details
            <ArrowUpRight size={13} className="opacity-70" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
