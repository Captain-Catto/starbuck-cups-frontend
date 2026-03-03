"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCart } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, FileText, Phone, User, MapPin, Mail } from "lucide-react";
import type { CartItem } from "@/types";
import { Header } from "@/components/layout/Header";
import { Cart } from "@/components/ui/Cart";
import { getFirstProductImageUrl } from "@/lib/utils/image";
import { trackConsultationSubmission } from "@/lib/analytics";
import {
  isValidPhoneNumber,
  getPhoneValidationErrorMessage,
} from "@/lib/utils/phoneValidation";
import OptimizedImage from "@/components/OptimizedImage";

interface ConsultationFormData {
  customerName: string;
  phoneNumber: string;
  email: string;
  address: string;
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  const totalItems = items.length;

  const [formData, setFormData] = useState<ConsultationFormData>({
    customerName: "",
    phoneNumber: "",
    email: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (
    field: keyof ConsultationFormData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.customerName.trim()) {
      toast.error("Vui lòng nhập họ tên");
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error("Vui lòng nhập số điện thoại");
      return false;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      toast.error(getPhoneValidationErrorMessage());
      return false;
    }

    if (!formData.address.trim()) {
      toast.error("Vui lòng nhập địa chỉ");
      return false;
    }

    return true;
  };

  const handleSubmitConsultation = async () => {
    if (!validateForm()) return;

    if (items.length === 0) {
      toast.error("Giỏ tư vấn trống! Vui lòng thêm sản phẩm trước.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Log cart items để debug
      console.log("🛒 CART ITEMS DEBUG:", {
        totalItems: items.length,
        items: items.map((item, index) => ({
          index,
          productId: item.product.id,
          productName: item.product.name,
          selectedColor: item.colorRequest,
          availableColors: item.product.productColors?.map((pc) => ({
            id: pc.color.id,
            name: pc.color.name,
            hexCode: pc.color.hexCode,
          })),
          capacity: item.product.capacity?.name,
          categories: item.product.productCategories?.map(
            (pc) => pc.category.name
          ),
        })),
      });

      const consultationData = {
        customer: {
          ...formData,
          email: formData.email || undefined, // Include email if provided
        },
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          color: item.colorRequest || "Chưa chọn",
          capacity: item.product.capacity?.name || "N/A",
          category:
            item.product.productCategories
              ?.map((pc) => pc.category.name)
              .join(", ") || "N/A",
        })),
        createdAt: new Date().toISOString(),
      };

      // Log dữ liệu consultation sẽ gửi lên backend
      console.log("📝 CONSULTATION DATA TO BACKEND:", consultationData);
      console.log(
        "📤 CONSULTATION JSON:",
        JSON.stringify(consultationData, null, 2)
      );

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      });

      if (response.ok) {
        const responseData = await response.json();

        toast.success(
          "Đã tạo đơn tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
          {
            duration: 5000,
          }
        );

        // Track consultation submission as conversion
        trackConsultationSubmission({
          id: responseData.data?.consultation?.id,
          totalItems: items.length,
          customerName: formData.customerName,
          items: items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            category: item.product.productCategories?.[0]?.category?.name,
          })),
        });

        // Clear cart and redirect
        dispatch(clearCart());
        router.push("/products");
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error || "Failed to create consultation";
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Có lỗi xảy ra khi tạo đơn tư vấn. Vui lòng thử lại.";
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        <div className="pt-24 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                Giỏ tư vấn trống
              </h1>
              <p className="text-zinc-400 mb-8">
                Bạn chưa có sản phẩm nào trong giỏ tư vấn.
              </p>
              <button
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
                Tiếp tục mua sắm
              </button>
            </div>
          </div>
        </div>
        <Cart />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="pt-16">
        <div className="max-w-6xl mx-auto p-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Giỏ tư vấn</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cart Items */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Sản phẩm cần tư vấn ({totalItems} sản phẩm)
              </h2>

              <div className="space-y-4">
                {items.map((item, index) => {
                  // Tạo unique key cho mỗi variant
                  const uniqueKey = `${item.product.id}-${
                    item.colorRequest || "no-color"
                  }-${index}`;
                  return <CartItemRow key={uniqueKey} item={item} />;
                })}
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-6">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Thông tin liên hệ
                </h2>
                <p className="text-zinc-400">
                  Vui lòng liên hệ hotline 0896686008 (Zalo) để được tư vấn
                  nhanh nhất
                </p>
              </div>
              <form className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <User className="w-4 h-4 inline mr-2" />
                    Họ và tên *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="Nhập họ và tên của bạn"
                    required
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Phone className="w-4 h-4 inline mr-2" />
                    Số điện thoại, hoặc số zalo *
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="Nhập số điện thoại hoặc số zalo"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <Mail className="w-4 h-4 inline mr-2" />
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="Nhập email (không bắt buộc)"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Địa chỉ *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500"
                    placeholder="Nhập địa chỉ của bạn"
                    required
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="button"
                  onClick={handleSubmitConsultation}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black"></div>
                      Đang tạo đơn...
                    </>
                  ) : (
                    <>
                      <FileText className="w-5 h-5" />
                      Tạo đơn tư vấn
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <p className="text-sm text-zinc-300">
                  <strong>Lưu ý:</strong> Sau khi tạo đơn tư vấn, chúng tôi sẽ
                  liên hệ với bạn trong vòng 24h để tư vấn chi tiết về các sản
                  phẩm và báo giá sản phẩm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Cart />
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-zinc-700 rounded-lg bg-zinc-800">
      <div className="relative w-16 h-16 flex-shrink-0">
        <OptimizedImage
          src={
            getFirstProductImageUrl(item.product.productImages) ||
            "/placeholder-product.jpg"
          }
          alt={item.product.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate">{item.product.name}</h3>
        <p className="text-sm text-zinc-400">
          Màu: {item.colorRequest || "Chưa chọn"} •{" "}
          {item.product.capacity?.name || "Chưa có"}
        </p>
        <p className="text-sm text-zinc-400">
          Danh mục:{" "}
          {item.product.productCategories
            ?.map((pc) => pc.category.name)
            .join(", ") || "N/A"}
        </p>
      </div>

      <div className="text-right">
        <p className="text-sm text-zinc-400">Sản phẩm quan tâm</p>
      </div>
    </div>
  );
}
