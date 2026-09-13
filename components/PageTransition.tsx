"use client";

/**
 * PageTransition — preserves the original App.tsx page-transition experience:
 * a short simulated-latency overlay ("Loading…") while the route resolves,
 * plus a smooth motion fade/slide between pages. Also shows
 * "Checking session…" while the Better Auth session is being restored
 * (e.g. on first load / page reload).
 */

import { useEffect, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

export default function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { authLoading } = useAuth();

  const [displayPath, setDisplayPath] = useState(pathname);
  const [isLoading, setIsLoading] = useState(false);

  // Simulated latency on route change (mirrors the original 300ms overlay)
  useEffect(() => {
    if (pathname !== displayPath) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        setDisplayPath(pathname);
        setIsLoading(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [pathname, displayPath]);

  return (
    <div className="flex flex-col flex-1">
      {/* Page transition / auth loading spinner */}
      <AnimatePresence>
        {(isLoading || authLoading) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-stone-50/60 backdrop-blur-sm"
          >
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-neutral-900" />
              <span className="text-xs font-mono tracking-widest text-neutral-500 uppercase">
                {authLoading ? 'Checking session…' : 'Loading…'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main view with animated transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={displayPath}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
          className="flex flex-col flex-1"
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
