import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import ClientLayout from "@/components/layout/ClientLayout";
import { generateSEO, generateOrganizationStructuredData } from "@/lib/seo";

export const metadata: Metadata = generateSEO({
  title: "Cửa hàng ly Starbucks chính thức",
  description:
    "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích. Tư vấn miễn phí qua Messenger.",
  keywords:
    "starbucks, ly starbucks, cups, tumbler, ly giữ nhiệt, starbucks vietnam",
  openGraph: {
    title: "Starbucks Cups Shop - Ly Starbucks chính thức",
    description:
      "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích",
    image: "/images/og-image.jpg",
    url: "/",
    type: "website",
  },
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationData = generateOrganizationStructuredData();

  return (
    <html lang="vi">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationData),
          }}
        />
      </head>
      <body>
        <StoreProvider>
          <ClientLayout>{children}</ClientLayout>
        </StoreProvider>
      </body>
    </html>
  );
}
