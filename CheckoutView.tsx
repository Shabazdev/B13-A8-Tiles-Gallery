/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

"use client";

import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  Truck,
  CreditCard,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/lib/toast-context";
import Image from "next/image";
import Link from "next/link";
const FREE_SHIPPING_THRESHOLD = 150;
const FLAT_SHIPPING_FEE = 9.95;

function calcShipping(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

function formatPrice(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function validateShipping(fields) {
  if (!fields.fullName.trim()) return "Full name is required.";
  if (!fields.phone.trim()) return "Phone number is required.";
  if (!fields.address.trim()) return "Address is required.";
  if (!fields.city.trim()) return "City is required.";
  if (!fields.postalCode.trim()) return "Postal code is required.";
  if (!fields.country.trim()) return "Country is required.";
  return null;
}

export default function CheckoutView() {
  const searchParams = useSearchParams();
  const { currentUser, authLoading } = useAuth();
  const { items, total: cartSubtotal, clearCart } = useCart();
  const { showToast } = useToast();

  const [fields, setFields] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });
  const [step, setStep] = useState("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!authLoading && !currentUser) {
      const loginUrl = new URL("/login", window.location.origin);
      loginUrl.searchParams.set("from", "/checkout");
      window.location.href = loginUrl.toString();
    }
  }, [authLoading, currentUser]);

  useEffect(() => {
    const oid = searchParams.get("orderId")?.trim();
    if (oid) {
      setOrderId(oid);
      setStep("success");
    }
  }, [searchParams]);

  const shippingCost = calcShipping(cartSubtotal);
  const grandTotal = Math.round((cartSubtotal + shippingCost) * 100) / 100;

  const handleFieldChange = (field) => (e) => {
    setFields((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePlaceOrder = async () => {
    const validationError = validateShipping(fields);
    if (validationError) {
      showToast(validationError, "error");
      return;
    }
    if (items.length === 0) {
      showToast("Your cart is empty.", "error");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const idempotencyKey = orderId ?? `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    const payload = {
      items: items.map(({ tile, quantity }) => ({ productId: tile.id, quantity })),
      shipping: {
        fullName: fields.fullName.trim(),
        phone: fields.phone.trim(),
        address: fields.address.trim(),
        city: fields.city.trim(),
        postalCode: fields.postalCode.trim(),
        country: fields.country.trim(),
      },
      idempotencyKey,
    };
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data?.message ?? "We could not place your order.";
        setError(msg);
        showToast(msg, "error");
        return;
      }
      const createdOrderId = data?.order?.orderId;
      if (!createdOrderId) {
        setError("No order ID returned.");
        showToast("No order ID returned.", "error");
        return;
      }
      clearCart();
      setOrderId(createdOrderId);
      setStep("success");
      showToast("Order placed!", "success");
    } catch {
      setError("Network error.");
      showToast("Network error.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || !currentUser) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 px-4 py-32 sm:px-6 lg:px-8">
        <Loader2 size={28} className="animate-spin text-neutral-400" />
        <p className="text-sm text-neutral-500 font-mono">Loading…</p>
      </div>
    );
  }

  if (step === "success" && orderId) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-5 font-sans text-2xl font-extrabold tracking-tight text-neutral-900">Order Confirmed</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 font-sans">Thank you for your order! Your order has been received.</p>
          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <Package size={16} />
              <span>Order ID</span>
            </div>
            <p className="mt-1 font-mono text-xs text-neutral-900 tracking-wider">
`${orderId}`
</p>
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => { window.location.href = "/my-profile"; }}
              className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-lg shadow-neutral-900/10 transition-all hover:bg-neutral-800">
              Go to My Profile
            </button>
            <button onClick={() => { window.location.href = "/all-tiles"; }}
              className="w-full rounded-xl border border-neutral-200 py-3 text-xs font-bold text-neutral-700 shadow-sm hover:bg-neutral-50">
              Continue Shopping
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl border border-rose-200 bg-white p-8 shadow-sm text-center"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
            <AlertCircle size={32} />
          </div>
          <h1 className="mt-5 font-sans text-2xl font-extrabold tracking-tight text-neutral-900">Checkout Failed</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-neutral-500 font-sans">
`${error}`
</p>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={() => { setError(null); setStep("cart"); }}
              className="w-full rounded-xl bg-neutral-900 py-3 text-xs font-bold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800">
              Try Again
            </button>
            <button onClick={() => { window.location.href = "/cart"; }}
              className="w-full rounded-xl border border-neutral-200 py-3 text-xs font-bold text-neutral-700 shadow-sm hover:bg-neutral-50">
              Back to Cart
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 space-y-2">
        <span className="font-mono text-xs font-bold uppercase tracking-widest text-neutral-400">Checkout</span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-neutral-900 sm:text-4xl">Complete Your Order</h1>
        <p className="text-sm text-neutral-500 font-sans">
`${items.length} ${items.length === 1 ? "item" : "items"} in your cart.`
</p>
      </div>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
            <Package size={16} />
            <span>Review Items</span>
          </div>
          
`${items.map(({ tile, quantity }) => (`
            <motion.div
              key=
`${tile.id}`

              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="flex gap-4 rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:gap-5 sm:p-5"
            >
              <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                <Image src=
`${tile.image}`
 alt=
`${tile.title}`
 width={80} height={80} className="h-full w-full object-cover" />
              </div>
              <div className="flex flex-1 flex-col justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-900 leading-tight">
`${tile.title}`
</h3>
                  <p className="text-[11px] text-neutral-500 font-mono mt-0.5">
`${tile.material} · ${tile.dimensions}`
</p>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-neutral-900">
`${formatPrice(tile.price)}`
</span>
                    <span className="text-[11px] text-neutral-400">×</span>
                    <span className="text-sm font-semibold text-neutral-700">
`${quantity}`
</span>
                  </div>
                  <span className="text-sm font-bold text-neutral-900">
`${formatPrice(tile.price * quantity)}`
</span>
                </div>
              </div>
            </motion.div>
          )).join("")})

          
`${items.length === 0 && (`
            <div className="rounded-2xl border border-dashed border-neutral-200 bg-white p-8 text-center">
              <p className="text-sm text-neutral-500">Your cart is empty.</p>
              <Link href="/all-tiles" className="mt-3 inline-flex items-center gap-2 rounded-xl bg-neutral-900 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-neutral-800">Browse Tiles</Link>
            </div>
          `)}

        </div>
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700 mb-4">
              <Truck size={16} />
              <span>Shipping Information</span>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="fullName" className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Full Name *</label>
                  <input id="fullName" type="text" value=
`${fields.fullName}`
 onChange=
`handleFieldChange("fullName")`
 placeholder="John Doe" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="phone" className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Phone *</label>
                  <input id="phone" type="tel" value=
`${fields.phone}`
 onChange=
`handleFieldChange("phone")`
 placeholder="+1 555-1234" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="address" className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Address *</label>
                  <input id="address" type="text" value=
`${fields.address}`
 onChange=
`handleFieldChange("address")`
 placeholder="123 Main St" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <label htmlFor="city" className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">City *</label>
                  <input id="city" type="text" value=
`${fields.city}`
 onChange=
`handleFieldChange("city")`
 placeholder="New York" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="postalCode" className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Postal Code *</label>
                  <input id="postalCode" type="text" value=
`${fields.postalCode}`
 onChange=
`handleFieldChange("postalCode")`
 placeholder="10001" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                </div>
                <div>
                  <label htmlFor="country" className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Country *</label>
                  <input id="country" type="text" value=
`${fields.country}`
 onChange=
`handleFieldChange("country")`
 placeholder="USA" className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2.5 text-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500" />
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-start gap-3 rounded-lg bg-neutral-50 p-3">
              <CreditCard size={16} className="mt-0.5 shrink-0 text-neutral-400" />
              <div>
                <p className="text-[11px] font-semibold text-neutral-600">Payment Method</p>
                <p className="text-xs text-neutral-500 mt-0.5">This order will be marked as pending payment.</p>
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-4">Order Summary</h2>
            <div className="space-y-3 border-b border-neutral-100 pb-4 text-sm">
              <div className="flex justify-between">
                <span className="text-neutral-500">Subtotal (
`${items.reduce((s, i) => s + i.quantity, 0)} items)`
</span>
                <span className="font-semibold text-neutral-900">
`${formatPrice(cartSubtotal)}`
</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Shipping</span>
                <span className="font-semibold 
`${shippingCost === 0 ? "text-emerald-600" : "text-neutral-900"}`
">
`${shippingCost === 0 ? "Free" : formatPrice(shippingCost)}`
</span>
              </div>
              
`${shippingCost > 0 && (`
                <p className="text-[11px] text-neutral-400 -mt-2">Add 
`${formatPrice(FREE_SHIPPING_THRESHOLD - cartSubtotal)}`
 more for free shipping</p>
              `)}

            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3">
              <span className="font-sans text-sm font-bold text-neutral-900">Total</span>
              <span className="font-mono text-lg font-extrabold text-neutral-900">
`${formatPrice(grandTotal)}`
</span>
            </div>
            <button onClick=
`handlePlaceOrder`
 disabled=
`isSubmitting || items.length === 0`
 className="mt-5 w-full rounded-xl bg-neutral-900 py-3.5 text-xs font-bold text-white shadow-lg shadow-neutral-900/10 hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60">
              
`${isSubmitting ? (`
                <span className="inline-flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Processing…
                </span>
              `) : (`
                <span className="inline-flex items-center justify-center gap-2">
                  <Lock size={14} />
                  Place Order · 
`${formatPrice(grandTotal)}`

                </span>
              `)}

            </button>
            <p className="mt-3 text-center text-[10px] text-neutral-400 font-mono">Secure checkout · Real order records in MongoDB</p>
          </div>
        </div>
      </div>
    </div>
  );
}

