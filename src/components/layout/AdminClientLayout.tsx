"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";
import { SettingsSocketProvider } from "@/components/providers/SettingsSocketProvider";

const EffectManager = dynamic(
  () => import("@/components/effects/EffectManager"),
  { ssr: false }
);

interface AdminClientLayoutProps {
  children: React.ReactNode;
}

export function AdminClientLayout({ children }: AdminClientLayoutProps) {
  const [isRuntimeReady, setIsRuntimeReady] = useState(false);

  useEffect(() => {
    const idleCallback = window.requestIdleCallback;

    if (idleCallback) {
      const id = idleCallback(() => setIsRuntimeReady(true), { timeout: 1500 });
      return () => window.cancelIdleCallback(id);
    }

    const timer = window.setTimeout(() => setIsRuntimeReady(true), 1200);
    return () => window.clearTimeout(timer);
  }, []);

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

export default AdminClientLayout;
