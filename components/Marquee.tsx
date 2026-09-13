"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';

export default function Marquee() {
  const marqueeText = "★  NEW ARRIVALS: Handcrafted Tuscan Clay & Emerald Subway Glass  ★  WEEKLY FEATURE: Modern Hexagonal Mosaic Patterns  ★  JOIN THE ARTISAN COMMUNITY  ★  FREE SWATCHES ON ALL ORDERS OVER $150  ";

  return (
    <div className="relative w-full overflow-hidden bg-neutral-950 py-3 text-white border-y border-neutral-800">
      <div className="flex whitespace-nowrap min-w-full">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{
            ease: "linear",
            duration: 35,
            repeat: Infinity,
          }}
          className="flex gap-4 pr-4 font-mono text-[11px] font-semibold tracking-widest uppercase text-neutral-300"
        >
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
          <span>{marqueeText}</span>
        </motion.div>
      </div>
    </div>
  );
}
