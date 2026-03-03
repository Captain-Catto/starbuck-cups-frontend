import { Metadata } from "next";
import { generateSEO } from "@/lib/seo";
import ContactsPageComponent from "@/components/pages/ContactsPage";

export const metadata: Metadata = generateSEO({
  title: "Liên hệ",
  description:
    "Liên hệ với H's shoucangpu - Chuyên cung cấp ly Starbucks chính hãng. Hotline: 0896 686 008, Zalo, Messenger.",
  keywords:
    "liên hệ, contact, starbucks, ly starbucks, hasron, zalo, messenger",
  openGraph: {
    title: "Liên hệ - H's shoucangpu",
    description:
      "Liên hệ với chúng tôi qua Hotline, Zalo hoặc Messenger để được tư vấn về sản phẩm ly Starbucks chính hãng.",
    image: "/images/placeholder.webp",
    url: "/contacts",
    type: "website",
  },
});

export default function ContactsPage() {
  return <ContactsPageComponent />;
}
