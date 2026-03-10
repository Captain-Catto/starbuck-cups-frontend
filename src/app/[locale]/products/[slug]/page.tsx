"use client";

import { Cart } from "@/components/ui/Cart";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import ProductInfo from "@/components/ProductInfo";
import RelatedProducts from "@/components/RelatedProducts";
import { useTranslations } from "next-intl";
import "@/components/ui/RichTextEditor.css";

export default function ProductDetailPage() {
  const t = useTranslations("common");
  const tProduct = useTranslations("productDetail");

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Breadcrumb */}
      <div className="pt-18 lg:pt-14">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: t("home"), href: "/" },
              { label: t("products"), href: "/products" },
              { label: tProduct("detail") },
            ]}
          />
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="container mx-auto px-4 pb-8">
        <ProductInfo />
      </div>

      {/* Related Products - Full width */}
      <div className="container mx-auto px-4 pb-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-6">
            {tProduct("youMayLike")}
          </h3>
          <RelatedProducts />
        </div>
      </div>

      <Cart />
    </div>
  );
}
