import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/lib/providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

export const metadata: Metadata = {
  title: "Tesserae — Premium Tiles Gallery Showcase",
  description:
    "A curated virtual showroom showcasing exquisite ceramic, glass, porcelain, and stone tile designs from the world's finest artisans.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      {/* suppressHydrationWarning: browser extensions (e.g. Demoway) inject
          attributes like data-demoway-document-id into <body> before React
          hydrates. This suppresses only attribute/child mismatches on <body>
          itself — it does not mask hydration errors elsewhere in the tree. */}
      <body
        className="min-h-screen flex flex-col bg-stone-50 font-sans text-neutral-800"
        suppressHydrationWarning
      >
        <Providers>
          <Header />
          <main className="flex-1">
            <PageTransition>{children}</PageTransition>
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
