"use client";

import { useState, useEffect } from "react";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import { toast } from "sonner";
import "react-loading-skeleton/dist/skeleton.css";

interface HomeProductGridProps {
  selectedCategory: string | null;
}

export default function HomeProductGrid({
  selectedCategory,
}: HomeProductGridProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visibleRows, setVisibleRows] = useState<Set<number>>(new Set());
  const [randomDelays, setRandomDelays] = useState<Map<string, number>>(
    new Map()
  );
  const dispatch = useAppDispatch();

  // Debug logs
  console.log("=== HomeProductGrid Debug ===");
  console.log("Selected category:", selectedCategory);
  console.log("Products count:", products.length);
  console.log("Loading:", loading);
  console.log("Products:", products.slice(0, 2)); // First 2 products

  // Generate random delays for products when they're loaded
  useEffect(() => {
    if (products.length > 0) {
      const delays = new Map();
      products.forEach((product) => {
        delays.set(product.id, Math.floor(Math.random() * 1000));
      });
      setRandomDelays(delays);
    }
  }, [products]);

  // Intersection Observer for scroll-triggered animations
  useEffect(() => {
    if (products.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const rowIndex = parseInt(
              entry.target.getAttribute("data-row") || "0"
            );
            setVisibleRows((prev) => new Set([...prev, rowIndex]));
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: "100px 0px -50px 0px",
      }
    );

    const observeRows = (retryCount = 0) => {
      const rowElements = document.querySelectorAll("[data-row]");

      if (rowElements.length > 0) {
        rowElements.forEach((el) => observer.observe(el));
      } else if (retryCount < 10) {
        setTimeout(() => observeRows(retryCount + 1), 200);
      }
    };

    const timeoutId = setTimeout(() => observeRows(), 300);

    return () => {
      clearTimeout(timeoutId);
      const rowElements = document.querySelectorAll("[data-row]");
      rowElements.forEach((el) => observer.unobserve(el));
    };
  }, [products.length, selectedCategory]);

  // Fetch products by category or newest products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        console.log("🚀 Starting to fetch products...");
        setLoading(true);
        setVisibleRows(new Set());

        let url = "/api/products?sortBy=createdAt&sortOrder=desc&limit=36";
        if (selectedCategory) {
          url = `/api/products?category=${selectedCategory}&limit=36`;
        }

        console.log("📡 Fetching from URL:", url);
        const response = await fetch(url);
        const data = await response.json();

        console.log("📦 Response data:", data);
        console.log("📊 Data success:", data.success);
        console.log("📊 Data items:", data.data?.items?.length || 0);

        if (data.success && data.data?.items) {
          setProducts(data.data.items);
          console.log("✅ Products set successfully:", data.data.items.length);
        } else {
          setProducts([]);
          console.log("❌ No products found or API error");
        }
      } catch (error) {
        console.error("❌ Error fetching products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
        console.log("🏁 Fetch completed, loading set to false");
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleAddToCart = (product: Product) => {
    dispatch(addToCart({ product, quantity: 1 }));
    toast.success(`Đã thêm ${product.name} vào giỏ hàng`, {
      duration: 3000,
    });
  };

  // Skeleton loading to prevent layout shift
  if (loading && products.length === 0) {
    return (
      <div className="space-y-6">
        {[...Array(6)].map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4"
          >
            {[...Array(6)].map((_, colIndex) => (
              <div
                key={colIndex}
                className="bg-black rounded-lg overflow-hidden"
              >
                <div className="aspect-square bg-black"></div>
                <div className="p-4">
                  <div className="h-4 bg-black rounded mb-2"></div>
                  <div className="h-3 bg-black rounded mb-3 w-3/4"></div>
                  <div className="h-8 bg-black rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // Empty state - only show when not loading and no products
  if (!loading && products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 text-lg">Không có sản phẩm nào</p>
      </div>
    );
  }

  // Render products in rows for animation
  const PRODUCTS_PER_ROW = 6;
  const productRows = [];
  for (let i = 0; i < products.length; i += PRODUCTS_PER_ROW) {
    productRows.push(products.slice(i, i + PRODUCTS_PER_ROW));
  }

  return (
    <div className="space-y-6">
      {productRows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          data-row={rowIndex}
          className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 transition-all duration-700 ${
            visibleRows.has(rowIndex)
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
        >
          {row.map((product) => {
            // Get stable random delay for this product
            const randomDelay = randomDelays.get(product.id) || 0;

            return (
              <div
                key={product.id}
                className={`transition-all duration-1000 ease-out ${
                  visibleRows.has(rowIndex)
                    ? "opacity-100 translate-y-0 scale-100"
                    : "opacity-0 translate-y-8 scale-95"
                }`}
                style={{
                  transitionDelay: visibleRows.has(rowIndex)
                    ? `${randomDelay}ms`
                    : "0ms",
                  transitionTimingFunction:
                    "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                }}
              >
                <ProductCard product={product} onAddToCart={handleAddToCart} />
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
