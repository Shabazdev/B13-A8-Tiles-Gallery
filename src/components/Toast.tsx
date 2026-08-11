/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onClose: () => void;
}

export default function Toast({ message, type, onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl border backdrop-blur-md ${
        type === 'success'
          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
          : type === 'error'
          ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
          : 'bg-zinc-800/85 border-zinc-700 text-zinc-300'
      }`}
    >
      {type === 'success' ? (
        <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
      ) : (
        <AlertCircle size={18} className="text-rose-500 flex-shrink-0" />
      )}
      <span className="text-sm font-medium">{message}</span>
      <button
        onClick={onClose}
        className="ml-2 p-1 hover:bg-white/10 rounded-lg transition-colors text-current opacity-70 hover:opacity-100"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}
