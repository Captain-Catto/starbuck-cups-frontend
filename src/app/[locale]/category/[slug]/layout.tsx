import { getTranslations } from "next-intl/server";
import { generateBreadcrumbStructuredData } from "@/lib/seo";
import { getApiUrl } from "@/lib/api-config";
import type { Category } from "@/types";

interface Props {
  params: Promise<{ slug: string; locale: string }>;
  children: React.ReactNode;
}

async function getCategory(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(getApiUrl(`categories/public/${slug}`), {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return null;
    const data = await response.json();
    return data.data || null;
  } catch {
    return null;
  }
}

export default async function CategoryLayout({ children, params }: Props) {
  const { slug, locale } = await params;
  const [category, tCommon] = await Promise.all([
    getCategory(slug),
    getTranslations({ locale, namespace: "common" }),
  ]);

  const categoryName = category?.name || slug;

  const breadcrumbJsonLd = generateBreadcrumbStructuredData(
    [
      { name: tCommon("home"), url: "/" },
      { name: tCommon("products"), url: "/products" },
      { name: categoryName, url: `/category/${slug}` },
    ],
    locale
  );

  return (
    <>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbJsonLd)}
      </script>
      {children}
    </>
  );
}
