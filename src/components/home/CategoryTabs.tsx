"use client";

import React from "react";
import { Category } from "@/types";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface CategoryTabsProps {
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (categorySlug: string | null) => void;
  loading?: boolean;
}

const CategoryTabsSkeleton = () => (
  <SkeletonTheme baseColor="#18181b" highlightColor="#27272a">
    <div className="flex flex-col items-center mb-8">
      {/* Title skeleton */}
      <div className="mb-6">
        <Skeleton height={36} width={200} />
      </div>

      {/* Category tabs skeleton */}
      <div className="flex flex-wrap justify-center gap-3">
        {[...Array(6)].map((_, index) => (
          <Skeleton
            key={index}
            height={48}
            width={index === 0 ? 80 : Math.floor(Math.random() * 60) + 100}
            className="rounded-full"
          />
        ))}
      </div>
    </div>
  </SkeletonTheme>
);

const CategoryTabs: React.FC<CategoryTabsProps> = ({
  categories,
  selectedCategory,
  onCategoryChange,
  loading = false,
}) => {
  if (loading) {
    return <CategoryTabsSkeleton />;
  }

  const handleCategoryClick = (categorySlug: string) => {
    onCategoryChange(categorySlug === selectedCategory ? null : categorySlug);
  };

  return (
    <div className="flex flex-col items-center mb-8">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => onCategoryChange(null)}
          className={`px-6 py-3 rounded-full font-medium transition-colors ${
            selectedCategory === null
              ? "bg-white text-black"
              : "bg-zinc-800 text-white hover:bg-zinc-700"
          }`}
        >
          Tất cả
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.slug)}
            className={`px-6 py-3 rounded-full font-medium transition-colors ${
              selectedCategory === category.slug
                ? "bg-white text-black"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
