import React from "react";
import StoreProvider from "@/components/StoreProvider";
import AdminClientLayout from "@/components/layout/AdminClientLayout";

export default function AdminHtmlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <meta name="theme-color" content="#000000" />
      </head>
      <body>
        <StoreProvider>
          <AdminClientLayout>{children}</AdminClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
