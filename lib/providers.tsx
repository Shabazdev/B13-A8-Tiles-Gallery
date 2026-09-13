"use client";

/**
 * Providers — wraps the client-side app in auth + toast contexts.
 */

import { ReactNode } from "react";
import { ToastProvider } from "./toast-context";
import { AuthProvider } from "./auth-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>{children}</AuthProvider>
    </ToastProvider>
  );
}
