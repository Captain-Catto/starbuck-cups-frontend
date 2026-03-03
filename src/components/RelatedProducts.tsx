"use client";

import { useEffect } from "react";
import { Product } from "@/types";
import { useAppDispatch, useAppSelector } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { fetchRelatedProducts } from "@/store/slices/productsSlice";
import ProductCard from "@/components/ProductCard";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";

// Import Swiper CSS
import "swiper/css";
import "swiper/css/navigation";

export default function RelatedProducts() {
  const dispatch = useAppDispatch();

  // Get data from Redux store
  const {
    currentProduct,
    relatedProducts,
    relatedProductsLoading: loading,
  } = useAppSelector((state) => state.products);


  useEffect(() => {
    // Fetch related products when current product is available
    if (currentProduct?.productCategories && currentProduct?.id) {
      const categoryIds = currentProduct.productCategories.map(pc => pc.category.id);
      dispatch(
        fetchRelatedProducts({
          categoryIds,
          currentProductId: currentProduct.id,
          limit: 10,
        })
      );
    }
  }, [currentProduct?.productCategories, currentProduct?.id, dispatch]); // Only depend on specific properties

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));
  };

  if (loading) {
    return (
      <div className="relative">
        {/* Custom Navigation Buttons */}
        <div className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer transition-colors border border-zinc-700">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </div>
        <div className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer transition-colors border border-zinc-700">
          <svg
            className="w-6 h-6 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={2}
          breakpoints={{
            640: {
              slidesPerView: 2,
            },
            768: {
              slidesPerView: 3,
            },
            1024: {
              slidesPerView: 4,
            },
          }}
          navigation={{
            nextEl: ".swiper-button-next-custom",
            prevEl: ".swiper-button-prev-custom",
          }}
          className="related-products-swiper !px-12"
        >
          {[...Array(8)].map((_, index) => (
            <SwiperSlide key={index}>
              <div className="animate-pulse bg-zinc-800 border border-zinc-700 rounded-lg overflow-hidden">
                <div className="aspect-square bg-zinc-700"></div>
                <div className="p-4">
                  <div className="h-4 bg-zinc-700 rounded mb-2"></div>
                  <div className="h-3 bg-zinc-700 rounded mb-3 w-3/4"></div>
                  <div className="h-8 bg-zinc-700 rounded"></div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    );
  }

  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Custom Navigation Buttons */}
      <div className="swiper-button-prev-custom absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer transition-colors border border-zinc-700">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
      </div>
      <div className="swiper-button-next-custom absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 rounded-full cursor-pointer transition-colors border border-zinc-700">
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>

      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: {
            slidesPerView: 2,
          },
          768: {
            slidesPerView: 3,
          },
          1024: {
            slidesPerView: 4,
          },
        }}
        navigation={{
          nextEl: ".swiper-button-next-custom",
          prevEl: ".swiper-button-prev-custom",
        }}
        className="related-products-swiper !px-12"
      >
        {relatedProducts.map((product) => (
          <SwiperSlide key={product.id}>
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
              showAddToCart={true}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
