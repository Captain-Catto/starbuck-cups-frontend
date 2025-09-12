"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Cart from "@/components/ui/Cart";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  // For admin routes, don't show customer header and cart
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            style: {
              fontFamily: "Inter, sans-serif",
            },
          }}
        />
      </div>
    );
  }

  // For customer routes, show full layout with header and cart
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Cart />
      <Toaster
        position="top-right"
        richColors
        closeButton
        toastOptions={{
          style: {
            fontFamily: "Inter, sans-serif",
          },
        }}
      />
    </div>
  );
}

export default ClientLayout;
