"use client";

import { useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { clearCart } from "@/store/slices/cartSlice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, FileText, Phone, User, MapPin } from "lucide-react";
import Image from "next/image";
import type { CartItem } from "@/types";

interface ConsultationFormData {
  customerName: string;
  phoneNumber: string;
  address: string;
}

export default function CartPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { items } = useAppSelector((state) => state.cart);

  const [formData, setFormData] = useState<ConsultationFormData>({
    customerName: "",
    phoneNumber: "",
    address: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

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

    if (!/^[0-9+\-\s()]+$/.test(formData.phoneNumber)) {
      toast.error("Số điện thoại không hợp lệ");
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
      toast.error("Giỏ hàng trống! Vui lòng thêm sản phẩm trước.");
      return;
    }

    setIsSubmitting(true);

    try {
      const consultationData = {
        customer: formData,
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          color: item.product.color.name,
          capacity: item.product.capacity.name,
          category: item.product.category.name,
        })),
        totalItems,
        createdAt: new Date().toISOString(),
      };

      // TODO: Call backend API to create consultation order
      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      });

      if (response.ok) {
        toast.success(
          "Đã tạo đơn tư vấn thành công! Chúng tôi sẽ liên hệ với bạn sớm.",
          {
            duration: 5000,
          }
        );

        // Clear cart and redirect
        dispatch(clearCart());
        router.push("/products");
      } else {
        throw new Error("Failed to create consultation");
      }
    } catch (error) {
      console.error("Error creating consultation:", error);
      toast.error("Có lỗi xảy ra khi tạo đơn tư vấn. Vui lòng thử lại.", {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Giỏ hàng trống
            </h1>
            <p className="text-gray-600 mb-8">
              Bạn chưa có sản phẩm nào trong giỏ hàng.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
              Tiếp tục mua sắm
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Giỏ hàng</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Cart Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sản phẩm cần tư vấn ({totalItems} sản phẩm)
            </h2>

            <div className="space-y-4">
              {items.map((item) => (
                <CartItemRow key={item.product.id} item={item} />
              ))}
            </div>
          </div>

          {/* Customer Information Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Thông tin liên hệ
            </h2>

            <form className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-2" />
                  Họ và tên *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    handleInputChange("customerName", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập họ và tên của bạn"
                  required
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="w-4 h-4 inline mr-2" />
                  Số điện thoại *
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber}
                  onChange={(e) =>
                    handleInputChange("phoneNumber", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập số điện thoại"
                  required
                />
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-2" />
                  Địa chỉ *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nhập địa chỉ của bạn"
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmitConsultation}
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>Lưu ý:</strong> Sau khi tạo đơn tư vấn, chúng tôi sẽ
                liên hệ với bạn trong vòng 24h để tư vấn chi tiết về các sản
                phẩm và báo giá phù hợp nhất.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CartItemRow({ item }: { item: CartItem }) {
  return (
    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={item.product.images[0] || "/placeholder-product.jpg"}
          alt={item.product.name}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 truncate">
          {item.product.name}
        </h3>
        <p className="text-sm text-gray-500">
          {item.product.color.name} • {item.product.capacity.name}
        </p>
        <p className="text-sm text-gray-500">
          Danh mục: {item.product.category.name}
        </p>
      </div>

      <div className="text-right">
        <p className="font-medium text-gray-900">Số lượng: {item.quantity}</p>
      </div>
    </div>
  );
}
