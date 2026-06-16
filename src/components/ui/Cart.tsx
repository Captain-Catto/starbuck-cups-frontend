"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import { selectCartItems, selectCartOpen } from "@/store/selectors";
import { removeFromCart, clearCart, closeCart } from "@/store/slices/cartSlice";
import { X, ShoppingBag, FileText } from "lucide-react";
import type { CartItem } from "@/types";
import { toast } from "sonner";
import { useRouter } from "@/i18n/routing";
import { getFirstProductImageUrl } from "@/lib/utils/image";
import { Link } from "@/i18n/routing";
import OptimizedImage from "@/components/OptimizedImage";
import { useTranslations } from "next-intl";

interface CartProps {
  className?: string;
}

const getProductColorNames = (item: CartItem, fallback: string) =>
  item.product.productColors
    ?.flatMap((productColor) =>
      productColor.color.name ? [productColor.color.name] : []
    )
    .join(", ") || item.colorRequest || fallback;

export function Cart({ className = "" }: CartProps) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const items = useAppSelector(selectCartItems);
  const isOpen = useAppSelector(selectCartOpen);
  const t = useTranslations("cart");

  const totalItems = items.length;

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart({ productId }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
  };

  const handleCreateConsultationOrder = () => {
    if (items.length === 0) {
      toast.error(t("emptyError"), {
        duration: 3000,
      });
      return;
    }

    // Close cart modal
    dispatch(closeCart());

    // Navigate to cart page for consultation form
    router.push("/cart");
  };

  const handleOpenProduct = () => {
    dispatch(closeCart());
  };

  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close cart"
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity duration-300 ${
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => dispatch(closeCart())}
      />

      {/* Cart Panel — always mounted so slide transition works */}
      <div
        className={`fixed right-0 top-0 size-full max-w-md z-50 bg-black border-l border-neutral-900 shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-900 flex-shrink-0">
          <h2 className="text-lg font-semibold text-white">
            {t("title", { count: totalItems })}
          </h2>
          <button type="button"
            onClick={() => dispatch(closeCart())}
            className="p-2 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-5 text-neutral-400" />
          </button>
        </div>

        {/* Clear Cart Button - Moved to top */}
        {items.length > 0 && (
          <button type="button"
            onClick={handleClearCart}
            className="w-full text-sm text-red-400/70 hover:text-red-400 transition-colors py-2 px-3 hover:bg-red-900/20 rounded-lg cursor-pointer"
          >
            {t("clearAll")}
          </button>
        )}

        {/* Cart Content */}
        <div className="flex flex-col flex-1 min-h-0">
          {items.length === 0 ? (
            // Empty Cart
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="size-16 bg-neutral-900 border border-neutral-800 rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="size-8 text-neutral-400" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                {t("emptyTitle")}
              </h3>
              <p className="text-neutral-400 mb-4">
                {t("emptyDescription")}
              </p>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-4 gap-y-4">
                {items.map((item) => {
                  return (
                    <CartItemCard
                      key={item.product.id}
                      item={item}
                      onRemove={() => handleRemoveItem(item.product.id)}
                      onOpenProduct={handleOpenProduct}
                    />
                  );
                })}
              </div>

              {/* Footer Actions - Fixed at bottom */}
              <div className="border-t border-neutral-900 bg-black p-4 space-y-3">
                {/* Consultation Order Button */}
                <button type="button"
                  onClick={handleCreateConsultationOrder}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-neutral-100 text-black font-medium rounded-lg transition-colors cursor-pointer"
                >
                  <FileText className="size-5" />
                  {t("createOrder")}
                </button>

                {/* Info Text */}
                <p className="text-xs text-neutral-400 text-center">
                  {t("createOrderInfo")}
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
  onOpenProduct: () => void;
}

function CartItemCard({ item, onRemove, onOpenProduct }: CartItemCardProps) {
  const { product } = item;
  const t = useTranslations("cart");
  const colorText = getProductColorNames(item, t("noColor"));

  return (
    <div className="flex gap-3 p-3 bg-black border border-neutral-900 rounded-lg">
      {/* Product Image */}
      <Link
        href={`/products/${product.slug}`}
        onClick={onOpenProduct}
        className="size-16 bg-neutral-950 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
      >
        {getFirstProductImageUrl(product.productImages) ? (
          <OptimizedImage
            src={getFirstProductImageUrl(product.productImages)}
            alt={product.name}
            width={64}
            height={64}
            className="size-full object-cover"
          />
        ) : (
          <div className="size-full flex items-center justify-center">
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
          onClick={onOpenProduct}
          className="hover:text-zinc-300 transition-colors"
        >
          <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
            {product.name}
          </h4>
        </Link>

        <div className="flex items-start gap-2 mb-2">
          {product.productColors && product.productColors.length > 0 ? (
            <div className="flex min-w-0 items-start gap-1">
              <div className="flex -gap-x-1 pt-0.5">
                {product.productColors.slice(0, 3).map((pc) => (
                  <div
                    key={pc.color.id}
                    className="size-3 rounded-full border border-neutral-800"
                    style={{
                      backgroundColor: pc.color.hexCode || "#ffffff",
                    }}
                    title={pc.color.name}
                  />
                ))}
                {product.productColors.length > 3 && (
                  <div className="size-3 rounded-full border border-neutral-800 bg-neutral-900 flex items-center justify-center">
                    <span className="text-[8px] text-neutral-400">
                      +{product.productColors.length - 3}
                    </span>
                  </div>
                )}
              </div>
              <span className="min-w-0 text-xs leading-relaxed text-neutral-400 break-words">
                {colorText} •{" "}
                {product.capacity?.name || t("notAvailable")}
              </span>
            </div>
          ) : (
            <span className="text-xs leading-relaxed text-neutral-400 break-words">
              {colorText} • {product.capacity?.name || t("notAvailable")}
            </span>
          )}
        </div>

      </div>

      {/* Remove Button */}
      <button type="button"
        onClick={onRemove}
        className="p-1 hover:bg-neutral-900 rounded transition-colors self-start cursor-pointer"
      >
        <X className="size-4 text-neutral-400" />
      </button>
    </div>
  );
}

export default Cart;
