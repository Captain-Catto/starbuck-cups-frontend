"use client";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "sonner";

interface AdminClientLayoutProps {
  children: React.ReactNode;
}

export function AdminClientLayout({ children }: AdminClientLayoutProps) {
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

export default AdminClientLayout;
