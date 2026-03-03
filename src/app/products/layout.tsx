import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "H's shoucangpu - Trang Sản Phẩm",
  description:
    "Khám phá bộ sưu tập ly St@rbucks đa dạng với nhiều màu sắc và dung tích. Tìm kiếm và lọc sản phẩm theo ý muốn.",
  keywords:
    "starbucks, ly starbucks, tumbler, cups, sản phẩm starbucks, ly giữ nhiệt",
  openGraph: {
    title: "H's shoucangpu - Trang Sản Phẩm",
    description:
      "Khám phá bộ sưu tập ly St@rbucks đa dạng với nhiều màu sắc và dung tích",
    type: "website",
    locale: "vi_VN",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
