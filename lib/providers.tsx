"use client";

/**
 * Providers — wraps the client-side app in auth + toast + cart contexts.
 */

import { ReactNode } from "react";
import { ToastProvider } from "./toast-context";
import { AuthProvider } from "./auth-context";
import { CartProvider } from "./cart-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>{children}</CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
