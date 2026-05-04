"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/routing";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { setCurrentProduct } from "@/store/slices/productsSlice";
import { toast } from "sonner";
import { PropertyGallery } from "@/components/ui/PropertyGallery";
import { trackProductView, trackAddToCart } from "@/lib/analytics";
import { trackProductClick, trackAddToCartClick } from "@/lib/productAnalytics";
import { useTranslations } from "next-intl";
import DOMPurify from "isomorphic-dompurify";
import RelatedProducts from "@/components/RelatedProducts";
import { Product } from "@/types";

interface ProductColor {
  color: { id: string; name: string; slug: string; hexCode: string };
}

interface ProductCategory {
  category: { id: string; name: string; slug: string };
}

interface Props {
  product: Product;
  relatedTitle: string;
}

export default function ProductClient({ product, relatedTitle }: Props) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations("productDetail");

  // Sync product to Redux so RelatedProducts can read it
  useEffect(() => {
    dispatch(setCurrentProduct(product));

    // Analytics
    trackProductView({
      id: product.id,
      name: product.name,
      category: product.productCategories?.[0]?.category?.name,
    });
    trackProductClick({
      id: product.id,
      name: product.name,
      category: product.productCategories?.[0]?.category?.name,
    });
  }, [product, dispatch]);

  const handleAddToCart = () => {
    if (product.stockQuantity > 0) {
      dispatch(addToCart({ product }));
      trackAddToCart({ id: product.id, name: product.name, category: product.productCategories?.[0]?.category?.name });
      trackAddToCartClick({ id: product.id, name: product.name, category: product.productCategories?.[0]?.category?.name });
    } else {
      toast.error(t("outOfStockError"), { duration: 3000 });
    }
  };

  const sortedImages = product.productImages?.slice().sort((a, b) => a.order - b.order).map((img) => img.url) || [];

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_450px] gap-6 lg:gap-8">
        {/* Gallery */}
        <div className="lg:sticky lg:top-20 lg:self-start min-w-0 overflow-hidden">
          <PropertyGallery images={sortedImages} title={product.name} isVip={product.isVip} />
        </div>

        {/* Info */}
        <div className="space-y-6">
          <div className="pb-3 border-b border-zinc-800">
            <h1 className="text-lg md:text-xl lg:text-2xl font-bold text-white">{product.name}</h1>
          </div>

          <div className="space-y-4">
            {/* Colors */}
            {product.productColors && product.productColors.length > 0 && (
              <div>
                <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t("color")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.productColors.map((pc: ProductColor) => (
                    <button
                      key={pc.color.id}
                      onClick={() => router.push(`/products?color=${pc.color.slug}`)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-500 rounded-lg transition-all cursor-pointer"
                    >
                      <div
                        className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full border border-zinc-500 flex-shrink-0"
                        style={{ backgroundColor: pc.color.hexCode || "#000000" }}
                      />
                      <span className="text-xs md:text-sm text-white">{pc.color.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Capacity */}
            {product.capacity && (
              <div>
                <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t("capacity")}
                </label>
                <button
                  onClick={() => router.push(`/products?minCapacity=${product.capacity!.volumeMl}&maxCapacity=${product.capacity!.volumeMl}`)}
                  className="inline-flex items-center px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-500 transition-all cursor-pointer"
                >
                  <span className="text-xs md:text-sm text-white">{product.capacity.name}</span>
                </button>
              </div>
            )}

            {/* Categories */}
            {product.productCategories && product.productCategories.length > 0 && (
              <div>
                <label className="block text-[10px] md:text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  {t("category")}
                </label>
                <div className="flex flex-wrap gap-2">
                  {product.productCategories.map((pc: ProductCategory) => (
                    <a
                      key={pc.category.id}
                      href={`/category/${pc.category.slug}`}
                      className="inline-flex items-center px-2.5 py-1.5 bg-zinc-800/50 border border-zinc-700 rounded-lg hover:bg-zinc-700 hover:border-zinc-500 transition-all cursor-pointer"
                    >
                      <span className="text-xs md:text-sm text-white">{pc.category.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black ${
                product.stockQuantity === 0
                  ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
                  : "bg-white text-black hover:bg-zinc-100 active:scale-[0.97] cursor-pointer"
              }`}
            >
              <ShoppingCart className="w-4 h-4 md:w-5 md:h-5" />
              {product.stockQuantity === 0 ? t("outOfStock") : t("addToCart")}
            </button>

            {product.productUrl && (
              <a
                href={product.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-xs md:text-sm border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 active:scale-[0.97] transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <ExternalLink className="w-4 h-4" />
                {t("viewClip")}
              </a>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-zinc-800">
              <h3 className="text-xs md:text-sm font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                {t("descriptionHeading")}
              </h3>
              <div className="prose prose-sm prose-invert max-w-none">
                <div
                  className="text-xs md:text-sm text-zinc-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description) }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div className="mt-8 bg-zinc-900 border border-zinc-800 rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-6">{relatedTitle}</h3>
        <RelatedProducts />
      </div>
    </>
  );
}
