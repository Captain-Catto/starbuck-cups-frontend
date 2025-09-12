"use client";

import { useState, useEffect } from "react";
import { useParams, notFound } from "next/navigation";
import {
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  Truck,
  Shield,
  RotateCcw,
} from "lucide-react";
import { useAppDispatch } from "@/store";
import { addToCart } from "@/store/slices/cartSlice";
import type { Product } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import Link from "next/link";
import RelatedProducts from "@/components/RelatedProducts";

export default function ProductDetailPage() {
  const params = useParams();
  const dispatch = useAppDispatch();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!params.slug) return;

      setLoading(true);
      try {
        const response = await fetch(`/api/products/public/${params.slug}`);
        const data = await response.json();

        console.log("Product data:", data);

        if (data.success && data.data) {
          setProduct(data.data);
        } else {
          console.error("Product not found or error:", data.message);
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [params.slug]);

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, quantity }));
      toast.success(`Đã thêm ${quantity} ${product.name} vào giỏ hàng`, {
        duration: 3000,
      });
    }
  };

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= (product?.stockQuantity || 0)) {
      setQuantity(newQuantity);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!product) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-green-600">
              Trang chủ
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-green-600">
              Sản phẩm
            </Link>
            <span>/</span>
            <span className="text-gray-900">{product.name}</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-15">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-lg overflow-hidden border border-gray-200">
              <Image
                src={
                  product.images[selectedImageIndex] ||
                  "/images/placeholder-product.jpg"
                }
                alt={product.name}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Images */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`aspect-square bg-white rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index
                      ? "border-green-600"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} - Ảnh ${index + 1}`}
                    width={150}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Basic Info */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`p-2 rounded-full border ${
                      isWishlisted
                        ? "bg-red-50 border-red-200 text-red-600"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Heart
                      className={`w-5 h-5 ${
                        isWishlisted ? "fill-current" : ""
                      }`}
                    />
                  </button>

                  <button className="p-2 rounded-full border bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Product Variants */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Màu sắc
                </label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-green-600"
                    style={{ backgroundColor: product.color.hexCode }}
                  />
                  <span className="text-gray-900">{product.color.name}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dung tích
                </label>
                <div className="inline-flex items-center px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-green-700 font-medium">
                    {product.capacity.name}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Danh mục
                </label>
                <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                  {product.category.name}
                </span>
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số lượng
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 min-w-[60px] text-center">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= product.stockQuantity}
                      className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600">
                    Còn {product.stockQuantity} sản phẩm
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleAddToCart}
                  className="flex items-center justify-center gap-2 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Thêm vào giỏ
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 mb-4">
                Đặc điểm sản phẩm
              </h3>

              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Truck className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Miễn phí giao hàng cho đơn từ 500.000đ
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Bảo hành chính hãng 12 tháng
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <RotateCcw className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-gray-700">
                    Đổi trả trong 7 ngày nếu có lỗi
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button className="px-6 py-4 text-green-600 border-b-2 border-green-600 font-medium">
                  Mô tả sản phẩm
                </button>
                <button className="px-6 py-4 text-gray-600 hover:text-gray-900">
                  Đánh giá (24)
                </button>
                <button className="px-6 py-4 text-gray-600 hover:text-gray-900">
                  Hướng dẫn sử dụng
                </button>
              </nav>
            </div>

            <div className="p-6">
              <div className="prose max-w-none">
                <h3>Thông tin chi tiết</h3>
                <p>{product.description}</p>

                <h4>Thông số kỹ thuật</h4>
                <ul>
                  <li>
                    Dung tích: {product.capacity.volumeMl}ml (
                    {product.capacity.name})
                  </li>
                  <li>Màu sắc: {product.color.name}</li>
                  <li>Chất liệu: Thép không gỉ cao cấp</li>
                  <li>Cách nhiệt: Lớp cách nhiệt kép</li>
                  <li>Giữ nhiệt: 6 giờ (nóng), 24 giờ (lạnh)</li>
                  <li>Xuất xứ: Starbucks chính hãng</li>
                </ul>

                <h4>Hướng dẫn bảo quản</h4>
                <ul>
                  <li>Rửa sạch bằng nước ấm và xà phòng sau mỗi lần sử dụng</li>
                  <li>Không sử dụng chất tẩy rửa mạnh</li>
                  <li>Không cho vào máy rửa chén</li>
                  <li>Bảo quản ở nơi khô ráo, thoáng mát</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product && <RelatedProducts currentProduct={product} />}
    </div>
  );
}
