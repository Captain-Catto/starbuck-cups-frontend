"use client";

import { memo, useCallback } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const PRODUCTS_PER_ROW = 4;

interface HomeProductGridProps {
  products: Product[];
  selectedCategory?: string | null;
}

const ProductRow = memo(function ProductRow({
  row,
  rowIndex,
}: {
  row: Product[];
  rowIndex: number;
}) {
  const dispatch = useAppDispatch();

  const handleAddToCart = useCallback((product: Product) => {
    dispatch(addToCart({ product }));
  }, [dispatch]);

  return (
    <ScrollReveal className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {row.map((product, productIndex) => {
        const globalIndex = rowIndex * PRODUCTS_PER_ROW + productIndex;
        return (
          <ProductCard
            key={product.id}
            product={product}
            onAddToCart={handleAddToCart}
            showAddToCart={true}
            priority={globalIndex === 0}
          />
        );
      })}
    </ScrollReveal>
  );
});

export default function HomeProductGrid({
  products,
  selectedCategory = null,
}: HomeProductGridProps) {
  const t = useTranslations("homePage");

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-lg">{t("noProducts")}</p>
      </div>
    );
  }

  const productRows: Product[][] = [];
  for (let i = 0; i < products.length; i += PRODUCTS_PER_ROW) {
    productRows.push(products.slice(i, i + PRODUCTS_PER_ROW));
  }

  return (
    <>
      <div className="space-y-6">
        {productRows.map((row, rowIndex) => (
          <ProductRow
            key={`${selectedCategory}-${rowIndex}`}
            row={row}
            rowIndex={rowIndex}
          />
        ))}
      </div>

      <div className="flex justify-center mt-12">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-semibold rounded-2xl relative overflow-hidden group transition-colors duration-300"
        >
          <div className="absolute inset-0 bg-zinc-800 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
          <span className="relative z-10 flex items-center gap-2">
            {t("viewAllProducts")}
            <ArrowRight className="size-5" />
          </span>
        </Link>
      </div>
    </>
  );
}
