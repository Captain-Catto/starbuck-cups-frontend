import { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { generateSEO } from "@/lib/seo";
import ContactsPageComponent from "@/components/pages/ContactsPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });

  return generateSEO({
    title: t("contactsTitle"),
    description: t("contactsDescription"),
    keywords: t("contactsKeywords"),
    locale,
    openGraph: {
      title: t("contactsOgTitle"),
      description: t("contactsOgDescription"),
      image: "/logo.png",
      url: "/contacts",
      type: "website",
    },
  });
}

export default async function ContactsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ContactsPageComponent />;
}
