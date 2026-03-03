"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { removeFromCart, clearCart, closeCart } from "@/store/slices/cartSlice";
import { X, ShoppingBag, FileText } from "lucide-react";
import type { CartItem } from "@/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { getFirstProductImageUrl } from "@/lib/utils/image";
import Link from "next/link";
import OptimizedImage from "@/components/OptimizedImage";

interface CartProps {
  className?: string;
}

export function Cart({ className = "" }: CartProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, isOpen } = useAppSelector((state) => state.cart);

  const totalItems = items.length;

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart({ productId }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCreateConsultationOrder = () => {
    if (items.length === 0) {
      toast.error("Giỏ tư vấn trống! Vui lòng thêm sản phẩm trước.", {
        duration: 3000,
      });
      return;
    }

    // Log cart items trước khi chuyển sang consultation
    console.log("🛒 CART ITEMS BEFORE CONSULTATION:", {
      totalItems: items.length,
      items: items.map((item, index) => ({
        index,
        productId: item.product.id,
        productName: item.product.name,
        selectedColor: item.colorRequest,
        productDetails: {
          capacity: item.product.capacity?.name,
          categories: item.product.productCategories?.map(
            (pc) => pc.category.name
          ),
          availableColors: item.product.productColors?.map(
            (pc) => pc.color.name
          ),
        },
      })),
    });

    // Close cart modal
    dispatch(closeCart());

    // Navigate to cart page for consultation form
    router.push("/cart");
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 transition-opacity"
        onClick={() => dispatch(closeCart())}
      />

      {/* Cart Panel */}
      <div
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-zinc-900 shadow-xl transform transition-transform flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
            Giỏ tư vấn ({totalItems} sản phẩm)
          </h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Clear Cart Button - Moved to top */}
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="w-full text-sm text-zinc-400 hover:text-red-400 transition-colors py-2 px-3 hover:bg-red-900/20 rounded-lg"
          >
            Xóa tất cả sản phẩm
          </button>
        )}

        {/* Cart Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            // Empty Cart
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-zinc-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Giỏ tư vấn trống
              </h3>
              <p className="text-zinc-400 mb-4">
                Thêm sản phẩm vào giỏ để được tư vấn chi tiết
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item, index) => {
                  return (
                    <CartItemCard
                      key={`${item.product.id}-${index}`}
                      item={item}
                      onRemove={() => handleRemoveItem(item.product.id)}
                    />
                  );
                })}
              </div>

              {/* Footer Actions - Fixed at bottom */}
              <div className="border-t border-zinc-800 bg-zinc-900 p-4 space-y-3">
                {/* Consultation Order Button */}
                <button
                  onClick={handleCreateConsultationOrder}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-black font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Tạo đơn tư vấn
                </button>

                {/* Info Text */}
                <p className="text-xs text-zinc-400 text-center">
                  Tạo đơn tư vấn để chúng tôi liên hệ tư vấn chi tiết về sản
                  phẩm và giá cả
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}

interface CartItemCardProps {
  item: CartItem;
  onRemove: () => void;
}

function CartItemCard({ item, onRemove }: CartItemCardProps) {
  const { product } = item;

  return (
    <div className="flex gap-3 p-3 bg-zinc-800 rounded-lg">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        className="w-16 h-16 bg-zinc-700 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        {getFirstProductImageUrl(product.productImages) ? (
          <OptimizedImage
            src={getFirstProductImageUrl(product.productImages)}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-2xl font-light text-white/30">
              {product.name.charAt(0)}
            </span>
          </div>
        )}
      </Link>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <Link
          href={`/products/${product.slug}`}
          className="hover:text-zinc-300 transition-colors"
        >
          <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
            {product.name}
          </h4>
        </Link>

        <div className="flex items-center gap-2 mb-2">
          {product.productColors && product.productColors.length > 0 ? (
            <div className="flex items-center gap-1">
              <div className="flex -space-x-1">
                {product.productColors.slice(0, 3).map((pc) => (
                  <div
                    key={pc.color.id}
                    className="w-3 h-3 rounded-full border border-zinc-600"
                    style={{
                      backgroundColor: pc.color.hexCode || "#ffffff",
                    }}
                    title={pc.color.name}
                  />
                ))}
                {product.productColors.length > 3 && (
                  <div className="w-3 h-3 rounded-full border border-zinc-600 bg-zinc-700 flex items-center justify-center">
                    <span className="text-[8px] text-zinc-300">
                      +{product.productColors.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-xs text-zinc-400">
                {product.productColors.length} màu •{" "}
                {product.capacity?.name || "Chưa có"}
              </span>
            </div>
          ) : (
            <span className="text-xs text-zinc-400">
              Chưa có màu • {product.capacity?.name || "Chưa có"}
            </span>
          )}
        </div>

        {/* Product Label */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-zinc-700 border border-zinc-600 rounded text-xs text-zinc-300">
            Quan tâm
          </span>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={onRemove}
        className="p-1 hover:bg-zinc-700 rounded transition-colors self-start"
      >
        <X className="w-4 h-4 text-zinc-400" />
      </button>
    </div>
  );
}

export default Cart;
