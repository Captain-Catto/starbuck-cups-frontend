"use client";

import React, { useState } from "react";
import { Category } from "@/types";
import HeroSection from "@/components/home/HeroSection";
import CategoryTabs from "@/components/home/CategoryTabs";
import HomeProductGrid from "@/components/HomeProductGrid";

interface HeroImageData {
  id: string;
  title: string;
  imageUrl: string;
  altText: string;
  order: number;
  isActive: boolean;
}

interface HomePageProps {
  categories: Category[];
  heroImages?: HeroImageData[];
  loading?: boolean;
}

const HomePage: React.FC<HomePageProps> = ({ categories, heroImages = [], loading = false }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-12">
      {/* Hero Section */}
      <HeroSection loading={loading} heroImages={heroImages} />

      {/* Categories Section */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
            loading={loading}
          />

          {/* Products Grid */}
          <HomeProductGrid selectedCategory={selectedCategory} />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
