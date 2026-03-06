"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster, toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearLastAction } from "@/store/slices/cartSlice";
import { SettingsSocketProvider } from "@/components/providers/SettingsSocketProvider";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// Dynamic imports for non-critical interactive widgets
const EffectManager = dynamic(() => import("@/components/effects/EffectManager"), {
  ssr: false,
});

const Cart = dynamic(() => import("@/components/ui/Cart"), {
  ssr: false,
});

const FloatingContactButton = dynamic(
  () =>
    import("@/components/ui/FloatingContactButton").then((mod) => ({
      default: mod.FloatingContactButton,
    })),
  {
    ssr: false,
  }
);

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const isAdminRoute = pathname?.startsWith("/admin");
  const [isRuntimeReady, setIsRuntimeReady] = useState(false);

  // Get cart state for global notifications
  const { lastAction } = useAppSelector((state) => state.cart);

  // Global cart notification handler
  useEffect(() => {
    if (lastAction) {
      switch (lastAction.type) {
        case "added":
          toast.success(`Đã thêm ${lastAction.productName} vào giỏ tư vấn`, {
            duration: 3000,
          });
          break;
        case "already_exists":
          toast.info(`${lastAction.productName} đã có trong giỏ tư vấn`, {
            duration: 3000,
          });
          break;
      }
      dispatch(clearLastAction());
    }
  }, [lastAction, dispatch]);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback;

    if (idleCallback) {
      const id = idleCallback(() => setIsRuntimeReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(() => setIsRuntimeReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

  // For admin routes, don't show customer header and cart
  if (isAdminRoute) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SettingsSocketProvider>
          {isRuntimeReady && <EffectManager />}
          <ErrorBoundary>{children}</ErrorBoundary>
        </SettingsSocketProvider>
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      {isRuntimeReady && <EffectManager />}
      <main className="flex-1">
        <ErrorBoundary>{children}</ErrorBoundary>
      </main>
      <Footer />
      {isRuntimeReady && <Cart />}
      {isRuntimeReady && <FloatingContactButton />}
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
