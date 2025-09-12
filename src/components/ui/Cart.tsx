"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  removeFromCart,
  updateQuantity,
  clearCart,
  closeCart,
} from "@/store/slices/cartSlice";
import { X, Plus, Minus, ShoppingBag, FileText } from "lucide-react";
import type { CartItem } from "@/types";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CartProps {
  className?: string;
}

export function Cart({ className = "" }: CartProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { items, isOpen } = useAppSelector((state) => state.cart);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    dispatch(updateQuantity({ productId, quantity: newQuantity }));
  };

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCreateConsultationOrder = () => {
    if (items.length === 0) {
      toast.error("Giỏ hàng trống! Vui lòng thêm sản phẩm trước.", {
        duration: 3000,
      });
      return;
    }

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
        className={`fixed right-0 top-0 h-full w-full max-w-md z-50 bg-white shadow-xl transform transition-transform flex flex-col ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-900">
            Giỏ tư vấn ({totalItems} sản phẩm)
          </h2>
          <button
            onClick={() => dispatch(closeCart())}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clear Cart Button - Moved to top */}
        {items.length > 0 && (
          <button
            onClick={handleClearCart}
            className="w-full text-sm text-gray-600 hover:text-red-600 transition-colors py-2 px-3 hover:bg-red-50 rounded-lg"
          >
            Xóa tất cả sản phẩm
          </button>
        )}

        {/* Cart Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            // Empty Cart
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Giỏ tư vấn trống
              </h3>
              <p className="text-gray-600 mb-4">
                Thêm sản phẩm vào giỏ để được tư vấn chi tiết qua Messenger
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {items.map((item) => (
                  <CartItemCard
                    key={item.product.id}
                    item={item}
                    onQuantityChange={handleQuantityChange}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Footer Actions - Fixed at bottom */}
              <div className="border-t bg-white p-4 space-y-3">
                {/* Consultation Order Button */}
                <button
                  onClick={handleCreateConsultationOrder}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
                >
                  <FileText className="w-5 h-5" />
                  Tạo đơn tư vấn
                </button>

                {/* Info Text */}
                <p className="text-xs text-gray-500 text-center">
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
  onQuantityChange: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}

function CartItemCard({ item, onQuantityChange, onRemove }: CartItemCardProps) {
  const { product, quantity } = item;
  const primaryImage = product.images?.[0] || "/images/placeholder-product.jpg";

  return (
    <div className="flex gap-3 p-3 bg-gray-50 rounded-lg">
      {/* Product Image */}
      <div className="w-16 h-16 bg-white rounded-lg overflow-hidden flex-shrink-0">
        <Image
          src={primaryImage}
          alt={product.name}
          width={64}
          height={64}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Product Info */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {product.name}
        </h4>

        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-full border border-gray-300"
            style={{ backgroundColor: product.color.hexCode }}
          />
          <span className="text-xs text-gray-600">
            {product.color.name} • {product.capacity.name}
          </span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onQuantityChange(product.id, quantity - 1)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            disabled={quantity <= 1}
          >
            <Minus className="w-3 h-3" />
          </button>

          <span className="px-2 py-1 bg-white border rounded text-sm min-w-[2rem] text-center">
            {quantity}
          </span>

          <button
            onClick={() => onQuantityChange(product.id, quantity + 1)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(product.id)}
        className="p-1 hover:bg-gray-200 rounded transition-colors self-start"
      >
        <X className="w-4 h-4 text-gray-400" />
      </button>
    </div>
  );
}

export default Cart;
