"use client";

import { useState, useEffect, useCallback } from "react";

interface ProductImage {
  id: string;
  url: string;
  altText: string;
  order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  isVip: boolean;
  productImages: ProductImage[];
  capacity?: {
    name: string;
    volumeMl: number;
  };
  productColors?: Array<{
    color: {
      name: string;
      hexCode: string;
    };
  }>;
  productCategories?: Array<{
    category: {
      name: string;
    };
  }>;
}

const DRIVE_HOSTNAMES = new Set([
  "drive.google.com",
  "docs.google.com",
]);

function convertDriveUrl(originalUrl: string): string {
  if (!originalUrl) {
    return originalUrl;
  }

  try {
    const url = new URL(originalUrl);

    if (url.hostname === "lh3.googleusercontent.com") {
      return originalUrl;
    }

    if (!DRIVE_HOSTNAMES.has(url.hostname)) {
      return originalUrl;
    }

    let id = url.searchParams.get("id");

    if (!id && url.pathname.includes("/d/")) {
      const parts = url.pathname.split("/");
      const idIndex = parts.findIndex((part) => part === "d");

      if (idIndex !== -1 && parts[idIndex + 1]) {
        id = parts[idIndex + 1];
      }
    }

    if (!id) {
      return originalUrl;
    }

    return `https://lh3.googleusercontent.com/d/${id}`;
  } catch (error) {
    console.warn("convertDriveUrl failed for url:", originalUrl, error);
    return originalUrl;
  }
}

export default function TestImagePage() {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [curlHeaders, setCurlHeaders] = useState<Record<string, string> | null>(
    null
  );
  const [curlHeadersError, setCurlHeadersError] = useState<string | null>(null);
  const [curlHeadersLoading, setCurlHeadersLoading] = useState(false);
  const testDriveUrl =
    "https://drive.google.com/uc?export=view&id=1vUnGK7HBcMN-ezuFi83ISKEYNxNVCLGR";
  const normalizedTestDriveUrl = convertDriveUrl(testDriveUrl);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "/api/products/public/ly-dion-chim-se-trang-nhu-collection-wild-nordic-tag-china591ml-trang-kem-beige-venti-20oz-591ml"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API Response:", data);

        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          throw new Error("Invalid API response structure");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, []);

  const fetchCurlHeaders = useCallback(async () => {
    try {
      setCurlHeadersLoading(true);
      setCurlHeadersError(null);
      setCurlHeaders(null);

      const response = await fetch(
        normalizedTestDriveUrl,
        { method: "HEAD" }
      );

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      setCurlHeaders(headers);
    } catch (err) {
      console.error("curl -I request failed:", err);
      setCurlHeadersError(
        err instanceof Error ? err.message : "Unknown error"
      );
    } finally {
      setCurlHeadersLoading(false);
    }
  }, [normalizedTestDriveUrl]);

  useEffect(() => {
    fetchCurlHeaders();
  }, [fetchCurlHeaders]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Đang tải sản phẩm...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-500 mb-4">Lỗi</h1>
          <p className="text-red-400">{error}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <p>Không tìm thấy sản phẩm</p>
      </div>
    );
  }

  const images =
    product.productImages
      ?.map((image) => ({
        ...image,
        url: convertDriveUrl(image.url),
      }))
      .sort((a, b) => a.order - b.order) || [];

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Test Hiển Thị Ảnh Sản Phẩm (Không Next.js Image)
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative bg-zinc-900 rounded-lg overflow-hidden aspect-square">
              {images.length > 0 ? (
                <img
                  src={images[currentImageIndex]?.url}
                  alt={images[currentImageIndex]?.altText || product.name}
                  className="w-full h-full object-contain"
                  style={{ imageRendering: "auto" }}
                  onError={(e) => {
                    console.error(
                      "Image failed to load:",
                      images[currentImageIndex]?.url
                    );
                    const target = e.target as HTMLImageElement;
                    target.src = "/images/placeholder.webp";
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-zinc-400">Không có hình ảnh</span>
                </div>
              )}

              {/* VIP Badge */}
              {product.isVip && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-black px-3 py-1 rounded-full text-sm font-bold">
                  VIP
                </div>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}

              {/* Navigation Arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev > 0 ? prev - 1 : images.length - 1
                      )
                    }
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                  >
                    ←
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev < images.length - 1 ? prev + 1 : 0
                      )
                    }
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full"
                  >
                    →
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex
                        ? "border-white"
                        : "border-transparent hover:border-zinc-500"
                    }`}
                  >
                    <img
                      src={image.url}
                      alt={image.altText}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/images/placeholder.webp";
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
              <p className="text-zinc-400 text-sm">Slug: {product.slug}</p>
            </div>

            {/* VIP Status */}
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">
                {product.isVip ? "⭐ Sản phẩm VIP" : "📦 Sản phẩm thường"}
              </span>
            </div>

            {/* Capacity */}
            {product.capacity && (
              <div>
                <h3 className="font-semibold mb-2">Dung tích:</h3>
                <p className="text-zinc-300">
                  {product.capacity.name} ({product.capacity.volumeMl}ml)
                </p>
              </div>
            )}

            {/* Colors */}
            {product.productColors && product.productColors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Màu sắc:</h3>
                <div className="flex flex-wrap gap-2">
                  {product.productColors.map((pc, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-full border border-zinc-600"
                        style={{ backgroundColor: pc.color.hexCode }}
                      ></div>
                      <span className="text-zinc-300">{pc.color.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Categories */}
            {product.productCategories &&
              product.productCategories.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Danh mục:</h3>
                  <div className="flex flex-wrap gap-2">
                    {product.productCategories.map((pc, idx) => (
                      <span
                        key={idx}
                        className="bg-zinc-800 px-3 py-1 rounded-full text-sm"
                      >
                        {pc.category.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            {/* Image Details */}
            <div>
              <h3 className="font-semibold mb-2">Chi tiết ảnh hiện tại:</h3>
              {images.length > 0 && (
                <div className="bg-zinc-900 p-4 rounded-lg">
                  <p>
                    <strong>URL:</strong>{" "}
                    <span className="text-blue-400 break-all">
                      {images[currentImageIndex]?.url}
                    </span>
                  </p>
                  <p>
                    <strong>Alt Text:</strong>{" "}
                    {images[currentImageIndex]?.altText}
                  </p>
                  <p>
                    <strong>Order:</strong> {images[currentImageIndex]?.order}
                  </p>
                  <p>
                    <strong>ID:</strong> {images[currentImageIndex]?.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* curl -I Debug */}
        <div className="mt-8 bg-zinc-900 p-4 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-semibold">
              curl -I {normalizedTestDriveUrl}
            </h3>
            <button
              onClick={fetchCurlHeaders}
              className="px-3 py-1 rounded-md bg-zinc-800 hover:bg-zinc-700 text-sm transition"
              disabled={curlHeadersLoading}
            >
              {curlHeadersLoading ? "Đang kiểm tra..." : "Kiểm tra lại"}
            </button>
          </div>
          {curlHeadersError && (
            <p className="mt-2 text-sm text-red-400">
              Lỗi: {curlHeadersError}
            </p>
          )}
          {curlHeaders && Object.keys(curlHeaders).length > 0 && (
            <div className="mt-3 space-y-1 text-sm text-zinc-300">
              <p className="text-zinc-500">
                Gốc Drive: <span className="text-zinc-300 break-all">{testDriveUrl}</span>
              </p>
              {Object.entries(curlHeaders).map(([key, value]) => (
                <p key={key}>
                  <span className="text-zinc-400">{key}:</span>{" "}
                  <span className="text-zinc-100">{value}</span>
                </p>
              ))}
            </div>
          )}
          {curlHeaders &&
            Object.keys(curlHeaders).length === 0 &&
            !curlHeadersError && (
              <p className="mt-2 text-sm text-zinc-400">
                Không nhận được header nào từ phản hồi.
              </p>
            )}
        </div>

        {/* Debug Info */}
        <div className="mt-8 bg-zinc-900 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Debug Info:</h3>
          <p>
            <strong>Total Images:</strong> {images.length}
          </p>
          <p>
            <strong>Current Index:</strong> {currentImageIndex}
          </p>
          <p>
            <strong>Product ID:</strong> {product.id}
          </p>
        </div>
      </div>
    </div>
  );
}
