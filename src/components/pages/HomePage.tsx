"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useDispatch } from "react-redux";
import { ShoppingCart, Star, MessageCircle, ArrowRight } from "lucide-react";
import { Product, Category } from "@/types";
import { addToCart } from "@/store/slices/cartSlice";
import { toast } from "sonner";

interface HomePageProps {
  featuredProducts: Product[];
  categories: Category[];
}

const HomePage: React.FC<HomePageProps> = ({
  featuredProducts,
  categories,
}) => {
  const dispatch = useDispatch();

  const handleAddToCart = (product: Product) => {
    dispatch(
      addToCart({
        product,
        quantity: 1,
      })
    );
  };

  const handleMessengerConsult = () => {
    const zaloNumber = process.env.NEXT_PUBLIC_ZALO_NUMBER || "0123456789";
    const message =
      "Xin chào! Tôi muốn được tư vấn về các sản phẩm ly Starbucks.";

    try {
      toast.success("Đang chuyển đến Zalo để tư vấn...", {
        duration: 3000,
      });
    } catch {
      toast.error(
        "Không thể mở Zalo. Vui lòng thử lại hoặc liên hệ trực tiếp.",
        {
          duration: 3000,
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-700 to-green-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Khám Phá Bộ Sưu Tập Ly Starbucks
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Những chiếc ly Starbucks chính thức với đa dạng màu sắc và dung
            tích. Tư vấn miễn phí qua Messenger để chọn sản phẩm phù hợp nhất.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center"
            >
              Xem Sản Phẩm <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
            <button
              onClick={handleMessengerConsult}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors inline-flex items-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Tư Vấn Miễn Phí
            </button>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Danh Mục Sản Phẩm
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/products?category=${category.id}`}
                className="group bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-48 bg-gradient-to-r from-green-400 to-green-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">
                    {category.name}
                  </span>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-green-600 transition-colors">
                    {category.name}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {category.description || "Khám phá bộ sưu tập ly đa dạng"}
                  </p>
                  <span className="text-green-600 font-semibold inline-flex items-center">
                    Xem thêm <ArrowRight className="ml-1 w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Sản Phẩm Nổi Bật
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
              >
                <Link href={`/products/${product.slug}`}>
                  <div className="relative h-48 bg-gray-200">
                    {product.images && product.images.length > 0 ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-cover hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-400 to-green-600">
                        <span className="text-white font-semibold">
                          {product.name}
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
                <div className="p-4">
                  <Link href={`/products/${product.slug}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <div className="flex items-center mb-2">
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <span className="text-gray-600 text-sm ml-2">(4.8)</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-green-600">
                      Liên hệ
                    </span>
                    <div className="flex items-center space-x-2">
                      {product.color && (
                        <div
                          className="w-4 h-4 rounded-full border border-gray-300"
                          style={{ backgroundColor: product.color.hexCode }}
                          title={product.color.name}
                        />
                      )}
                      {product.capacity && (
                        <span className="text-xs text-gray-500">
                          {product.capacity.volumeMl}ml
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors inline-flex items-center justify-center"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      Thêm vào giỏ
                    </button>
                    <Link
                      href={`/products/${product.slug}`}
                      className="px-4 py-2 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors"
                    >
                      Chi tiết
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/products"
              className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors inline-flex items-center"
            >
              Xem Tất Cả Sản Phẩm <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Tại Sao Chọn Chúng Tôi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">
                Sản Phẩm Chính Hãng
              </h3>
              <p className="text-gray-600">
                Tất cả sản phẩm đều là ly Starbucks chính thức, đảm bảo chất
                lượng và độ bền cao.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Tư Vấn Miễn Phí</h3>
              <p className="text-gray-600">
                Đội ngũ tư vấn chuyên nghiệp sẵn sàng hỗ trợ bạn chọn sản phẩm
                phù hợp qua Messenger.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShoppingCart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Giao Hàng Nhanh</h3>
              <p className="text-gray-600">
                Giao hàng toàn quốc, đóng gói cẩn thận, cam kết hàng nguyên vẹn
                khi đến tay bạn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-green-700 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Bắt Đầu Mua Sắm Ngay Hôm Nay
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Khám phá bộ sưu tập ly Starbucks đa dạng và tìm chiếc ly hoàn hảo
            cho bạn.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/products"
              className="bg-white text-green-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              Mua Sắm Ngay
            </Link>
            <button
              onClick={handleMessengerConsult}
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-green-700 transition-colors inline-flex items-center justify-center"
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Nhận Tư Vấn
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
