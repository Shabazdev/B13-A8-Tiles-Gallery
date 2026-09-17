"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { useCart } from '@/lib/cart-context';
import { useToast } from '@/lib/toast-context';
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingCart,
  ShoppingBag,
  Trash2,
  Loader2,
} from 'lucide-react';

export default function CartPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const { items, total, itemCount, isLoading, updateQuantity, removeFromCart, clearCart } =
    useCart();

  const handleCheckout = () => {
    router.push('/checkout');
  };

  // Hydration guard: cart is restored from localStorage on mount.
  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-32 sm:px-6 lg:px-8">
        <Loader2 size={28} className="animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500 font-mono">Loading your cart…</p>
      </div>
    );
  }

  // Empty state
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md rounded-2xl border border-dashed border-neutral-200 bg-white py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 text-neutral-400">
            <ShoppingCart size={26} />
          </div>
          <h1 className="mt-5 font-sans text-xl font-extrabold tracking-tight text-neutral-900">
            Your cart is empty
          </h1>
          <p className="mt-2 text-sm text-neutral-500 font-sans">
            Browse the gallery and add some beautiful tiles to get started.
          </p>
          <button
            onClick={() => router.push('/all-tiles')}
            id="btn-cart-browse"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-neutral-800"
          >
            <ShoppingBag size={14} />
            Browse the Gallery
          </button>
        </div>
      </div>
    );
  }



  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-10 space-y-2">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">
          Checkout
        </span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">
          Your Cart
        </h1>
        <p className="text-sm text-neutral-500 font-sans">
          {itemCount} {itemCount === 1 ? 'item' : 'items'} saved for your next project.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map(({ tile, quantity }) => (
            <motion.div
              key={tile.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5"
            >
              {/* Thumbnail */}
              <div
                onClick={() => router.push(`/tile/${tile.id}`)}
                className="relative h-24 w-24 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl bg-neutral-100 sm:h-28 sm:w-28"
              >
                <img
                  src={tile.image}
                  alt={tile.title}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover object-center transition-transform duration-500 hover:scale-105"
                />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col justify-between gap-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3
                      onClick={() => router.push(`/tile/${tile.id}`)}
                      className="cursor-pointer font-sans text-sm font-semibold text-neutral-900 hover:text-neutral-700"
                    >
                      {tile.title}
                    </h3>
                    <p className="mt-0.5 text-[10px] text-neutral-400 font-mono uppercase tracking-wider">
                      {tile.material} • {tile.dimensions}
                    </p>
                  </div>
                  <span className="font-mono text-sm font-bold text-neutral-900 flex-shrink-0">
                    ${(tile.price * quantity).toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Quantity Stepper */}
                  <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-200">
                    <button
                      onClick={() => updateQuantity(tile.id, quantity - 1)}
                      id={`btn-dec-${tile.id}`}
                      aria-label="Decrease quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-8 text-center text-sm font-semibold text-neutral-900">
                      {quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(tile.id, quantity + 1)}
                      id={`btn-inc-${tile.id}`}
                      aria-label="Increase quantity"
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => {
                      removeFromCart(tile.id);
                      showToast(`"${tile.title}" removed from cart.`, 'info');
                    }}
                    id={`btn-remove-${tile.id}`}
                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-neutral-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                  >
                    <Trash2 size={13} />
                    Remove
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Back / Clear actions */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              onClick={() => router.push('/all-tiles')}
              className="group inline-flex items-center gap-2 text-xs font-bold text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
              Continue Shopping
            </button>
            <button
              onClick={() => {
                clearCart();
                showToast('Your cart has been cleared.', 'info');
              }}
              id="btn-clear-cart"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-400 transition-colors hover:text-rose-600"
            >
              <Trash2 size={13} />
              Clear Cart
            </button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400">
              Order Summary
            </h2>

            <div className="space-y-2.5 border-b border-neutral-100 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal</span>
                <span className="font-semibold text-neutral-900">${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="font-semibold text-emerald-600">Free</span>
              </div>
            </div>

            <div className="flex justify-between pb-2">
              <span className="font-sans text-sm font-bold text-neutral-900">Total</span>
              <span className="font-mono text-lg font-extrabold text-neutral-900">
                ${total.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleCheckout}
              id="btn-checkout"
              className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-neutral-800 active:scale-[0.99]"
            >
              Proceed to Checkout
            </button>

            <p className="text-center text-[10px] text-neutral-400 font-mono">
              Prices in USD • Cart saved locally
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

