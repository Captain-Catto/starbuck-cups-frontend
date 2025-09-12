import { Metadata } from "next";
import { generateSEO, generateBreadcrumbStructuredData } from "@/lib/seo";
import HomePage from "@/components/pages/HomePage";
import { Product, Category } from "@/types";

interface HomePageProps {
  featuredProducts: Product[];
  categories: Category[];
}

export const metadata: Metadata = generateSEO({
  title: "Trang chủ",
  description:
    "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích. Tư vấn miễn phí qua Messenger.",
  openGraph: {
    title: "Starbucks Cups Shop - Ly Starbucks chính thức",
    description:
      "Khám phá bộ sưu tập ly Starbucks đa dạng với nhiều màu sắc và dung tích",
    image: "/images/og-home.jpg",
    url: "/",
    type: "website",
  },
});

// Server-side data fetching
async function getHomePageData(): Promise<HomePageProps> {
  try {
    // Mock data for development
    const mockProducts: Product[] = [
      {
        id: "1",
        name: "Starbucks Classic Tumbler",
        description: "Ly giữ nhiệt Starbucks kinh điển, chất liệu cao cấp",
        slug: "starbucks-classic-tumbler",
        images: ["/images/products/tumbler-1.jpg"],
        stockQuantity: 50,
        categoryId: "1",
        colorId: "1",
        capacityId: "1",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        category: {
          id: "1",
          name: "Tumbler",
          slug: "tumbler",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        color: {
          id: "1",
          name: "Xanh lá",
          hexCode: "#00704A",
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        capacity: {
          id: "1",
          name: "Grande",
          volumeMl: 473,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      },
    ];

    const mockCategories: Category[] = [
      {
        id: "1",
        name: "Tumbler",
        slug: "tumbler",
        description: "Ly giữ nhiệt cao cấp",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Mug",
        slug: "mug",
        description: "Cốc uống nóng truyền thống",
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    return {
      featuredProducts: mockProducts,
      categories: mockCategories,
    };
  } catch (error) {
    console.error("Error fetching home page data:", error);
    return {
      featuredProducts: [],
      categories: [],
    };
  }
}

export default async function Page() {
  const { featuredProducts, categories } = await getHomePageData();

  const breadcrumbData = generateBreadcrumbStructuredData([
    { name: "Trang chủ", url: "/" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbData),
        }}
      />
      <HomePage featuredProducts={featuredProducts} categories={categories} />
    </>
  );
}
