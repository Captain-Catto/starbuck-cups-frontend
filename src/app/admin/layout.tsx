import React from "react";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import StoreProvider from "@/components/StoreProvider";
import AdminClientLayout from "@/components/layout/AdminClientLayout";

export default async function AdminHtmlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages({ locale: "vi" });

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
        <NextIntlClientProvider locale="vi" messages={messages}>
          <StoreProvider>
            <AdminClientLayout>{children}</AdminClientLayout>
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
