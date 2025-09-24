"use client";

import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Cart } from "@/components/ui/Cart";
import ProductInfo from "@/components/ProductInfo";
import ProductDescription from "@/components/ProductDescription";
import RelatedProducts from "@/components/RelatedProducts";
import { useAppSelector } from "@/store";
import "@/components/ui/RichTextEditor.css";

export default function ProductDetailPage() {
  // Get product data from Redux store
  const {
    currentProduct: product,
    currentProductLoading: loading,
  } = useAppSelector((state) => state.products);
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Breadcrumb */}
      <div className="pt-12">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Link href="/" className="hover:text-white transition-colors">
              Trang chủ
            </Link>
            <span>/</span>
            <Link
              href="/products"
              className="hover:text-white transition-colors"
            >
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-white">Chi tiết sản phẩm</span>
          </div>
        </div>
      </div>

      {/* Product Detail Content */}
      <div className="grid grid-cols-1 lg:gap-6">
        <div className="container mx-auto px-4">
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
