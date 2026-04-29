"use client";

import { useState, useEffect, useRef } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { Link } from "@/i18n/routing";
import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const PRODUCTS_PER_ROW = 4;

interface HomeProductGridProps {
  selectedCategory?: string | null;
}

function ProductRow({
  row,
  rowIndex,
}: {
  row: Product[];
  rowIndex: number;
  onAddToCart: (product: Product) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const dispatch = useAppDispatch();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));
  };

  return (
    <div
      ref={ref}
      className={`grid grid-cols-2 lg:grid-cols-4 gap-4 transition-all duration-700 ease-out ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
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
    </div>
  );
}

export default function HomeProductGrid({
  selectedCategory = null,
}: HomeProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const dispatch = useAppDispatch();
  const t = useTranslations("homePage");
  const locale = useLocale();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setProducts([]);
        const url = `/api/products?sortBy=createdAt&sortOrder=desc&limit=12&locale=${locale}`;
        const response = await fetch(url);
        const data = await response.json();
        if (data.success && data.data?.items) {
          setProducts(data.data.items);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [locale]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, rowIndex) => (
          <div key={rowIndex} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, colIndex) => (
              <div key={colIndex} className="bg-zinc-900 rounded-lg overflow-hidden animate-pulse">
                <div className="aspect-square bg-zinc-800" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-800 rounded w-3/4" />
                  <div className="h-3 bg-zinc-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

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
            onAddToCart={handleAddToCart}
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
            <ArrowRight className="w-5 h-5" />
          </span>
        </Link>
      </div>
    </>
  );
}
