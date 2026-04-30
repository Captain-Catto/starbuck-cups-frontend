"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { fetchRelatedProducts } from "@/store/slices/productsSlice";
import ProductCard from "@/components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useLocale } from "next-intl";

export default function RelatedProducts() {
  const dispatch = useAppDispatch();
  const locale = useLocale();
  const [stylesReady, setStylesReady] = useState(false);

  // Get data from Redux store
  const {
    currentProduct,
    relatedProducts,
    relatedProductsLoading: loading,
  } = useAppSelector((state) => state.products);


  useEffect(() => {
    let isMounted = true;

    Promise.all([import("swiper/css"), import("swiper/css/navigation")])
      .then(() => {
        if (isMounted) {
          setStylesReady(true);
        }
      })
      .catch(() => {
        if (isMounted) {
          setStylesReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Fetch related products when current product is available
    if (currentProduct?.productCategories && currentProduct?.id) {
      const categoryIds = currentProduct.productCategories.map(pc => pc.category.id);
      dispatch(
        fetchRelatedProducts({
          categoryIds,
          currentProductId: currentProduct.id,
          limit: 10,
          locale,
        })
      );
    }
  }, [currentProduct?.productCategories, currentProduct?.id, dispatch, locale]); // Only depend on specific properties

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));
  };

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse bg-zinc-800 rounded-2xl overflow-hidden">
            <div className="aspect-square bg-zinc-700" />
          </div>
        ))}
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  if (!stylesReady) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {relatedProducts.slice(0, 4).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            showAddToCart={true}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Custom Navigation Buttons - desktop only */}
      <div className="swiper-button-prev-custom hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer transition-colors border border-zinc-700">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </div>
      <div className="swiper-button-next-custom hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer transition-colors border border-zinc-700">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={12}
        slidesPerView={1.5}
        slidesPerGroup={1}
        breakpoints={{
          640: {
            slidesPerView: 3,
            slidesPerGroup: 3,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 4,
            slidesPerGroup: 4,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 5,
            slidesPerGroup: 5,
            spaceBetween: 16,
          },
        }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        className="related-products-swiper md:!px-12"
      >
        {relatedProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
              showAddToCart={false}
              showBadges={true}
              showInfo={false}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
