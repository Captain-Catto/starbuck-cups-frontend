"use client";

import { Header } from "@/components/layout/Header";
import { Cart } from "@/components/ui/Cart";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import ProductInfo from "@/components/ProductInfo";
import ProductDescription from "@/components/ProductDescription";
import RelatedProducts from "@/components/RelatedProducts";
import { useAppSelector } from "@/store";
import "@/components/ui/RichTextEditor.css";

export default function ProductDetailPage() {
  // Get product data from Redux store
  const { currentProduct: product, currentProductLoading: loading } =
    useAppSelector((state) => state.products);
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Breadcrumb */}
      <div className="pt-18 lg:pt-14">
        <div className="container mx-auto px-4 py-4">
          <Breadcrumb
            items={[
              { label: "Trang chủ", href: "/" },
              { label: "Sản phẩm", href: "/products" },
              { label: "Chi tiết sản phẩm" },
            ]}
          />
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="grid grid-cols-1 lg:gap-6 pb-4">
        <div className="container mx-auto px-4 pb-4">
          {/* Product Info Section */}
          <ProductInfo />
        </div>

        {/* Bottom Section - Description and Related Products */}
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 sm:gap-4 lg:gap-6">
            {/* Product Description Component */}
            <ProductDescription product={product} loading={loading} />

            {/* Related Products */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-6">
                Có Thể Bạn Thích
              </h3>
              <RelatedProducts />
            </div>
          </div>
        </div>

        {/* Cart Sidebar */}
        <Cart />
      </div>
    </div>
  );
}
