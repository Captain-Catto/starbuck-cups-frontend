"use client";

import { memo, useState } from "react";
import { useAppSelector, useAppDispatch } from "@/store";
import { selectCartItems } from "@/store/selectors";
import { clearCart } from "@/store/slices/cartSlice";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ChevronLeft, FileText, Phone, User, MapPin, Mail } from "lucide-react";
import type { CartItem } from "@/types";
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

const getCartItemColorText = (item: CartItem, fallback: string) => {
  const colorNames =
    item.product.productColors
      ?.flatMap((productColor) =>
        productColor.color.name ? [productColor.color.name] : []
      )
      .join(", ") || "";

  return colorNames || item.colorRequest || fallback;
};

export default function CartPageClient() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);
  const t = useTranslations("cart");
  const tForm = useTranslations("cartForm");
  const tCommon = useTranslations("common");

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
      toast.error(tForm("nameRequired"));
      return false;
    }

    if (!formData.phoneNumber.trim()) {
      toast.error(tForm("phoneRequired"));
      return false;
    }

    if (!isValidPhoneNumber(formData.phoneNumber)) {
      toast.error(getPhoneValidationErrorMessage());
      return false;
    }

    if (!formData.address.trim()) {
      toast.error(tForm("addressRequired"));
      return false;
    }

    return true;
  };

  const handleSubmitConsultation = async () => {
    if (!validateForm()) return;

    if (items.length === 0) {
      toast.error(t("emptyError"));
      return;
    }

    setIsSubmitting(true);

    try {
      const consultationData = {
        customer: {
          ...formData,
          email: formData.email || undefined,
        },
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          color: getCartItemColorText(item, t("colorNotSelected")),
          capacity: item.product.capacity?.name || t("notAvailable"),
          category:
            item.product.productCategories
              ?.map((pc) => pc.category.name)
              .join(", ") || t("notAvailable"),
        })),
        createdAt: new Date().toISOString(),
      };

      const response = await fetch("/api/consultations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(consultationData),
      });

      if (response.ok) {
        const responseData = await response.json();

        toast.success(tForm("successMessage"), {
          duration: 5000,
        });

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

        dispatch(clearCart());
        router.push("/products");
      } else {
        let errorMessage = tForm("errorGeneric");
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch {
          // Response is not JSON (e.g. 502 HTML page)
        }
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : tForm("errorGeneric");
      toast.error(errorMessage, {
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <div className="pt-24 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">
                {t("emptyTitle")}
              </h1>
              <p className="text-zinc-400 mb-8">{t("emptyMessage")}</p>
              <button type="button"
                onClick={() => router.push("/products")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <ChevronLeft className="size-5" />
                {tCommon("continueShopping")}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-6 sm:p-4">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl font-bold text-white sm:text-3xl">
              {tForm("consultationCart")}
            </h1>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Cart Items */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 sm:p-6">
              <h2 className="mb-4 text-lg font-semibold leading-snug text-white sm:text-xl">
                {tForm("productsToConsult", { count: totalItems })}
              </h2>

              <div className="space-y-4">
                {items.map((item, index) => {
                  const uniqueKey = `${item.product.id}-${
                    item.colorRequest || "no-color"
                  }-${index}`;
                  return <CartItemRow key={uniqueKey} item={item} />;
                })}
              </div>
            </div>

            {/* Customer Information Form */}
            <div className="bg-zinc-900 rounded-lg border border-zinc-800 p-4 sm:p-6">
              <div className="mb-6">
                <h2 className="text-lg font-semibold leading-snug text-white sm:text-xl">
                  {tForm("contactInfo")}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-zinc-400 sm:text-base">
                  {tForm("contactHint")}
                </p>
              </div>
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="page-text">
                    <User className="size-4 inline mr-2" />
                    {tForm("fullName")}
                  </label>
                  <input aria-label="text"
                    type="text"
                    value={formData.customerName}
                    onChange={(e) =>
                      handleInputChange("customerName", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 sm:text-base"
                    placeholder={tForm("fullNamePlaceholder")}
                    required id="page-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="page-tel">
                    <Phone className="size-4 inline mr-2" />
                    {tForm("phone")}
                  </label>
                  <input aria-label="tel"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) =>
                      handleInputChange("phoneNumber", e.target.value)
                    }
                    className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 sm:text-base"
                    placeholder={tForm("phonePlaceholder")}
                    required id="page-tel"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="page-email">
                    <Mail className="size-4 inline mr-2" />
                    {tForm("email")}
                  </label>
                  <input aria-label="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 sm:text-base"
                    placeholder={tForm("emailPlaceholder")} id="page-email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2" htmlFor="page-form-control">
                    <MapPin className="size-4 inline mr-2" />
                    {tForm("address")}
                  </label>
                  <textarea aria-label="Form control"
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    rows={3}
                    className="w-full px-3 py-2 text-sm bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-400 focus:ring-2 focus:ring-zinc-500 focus:border-zinc-500 sm:text-base"
                    placeholder={tForm("addressPlaceholder")}
                    required id="page-form-control"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSubmitConsultation}
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white text-black font-medium rounded-lg hover:bg-zinc-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full size-5 border-b-2 border-black"></div>
                      {tForm("submitting")}
                    </>
                  ) : (
                    <>
                      <FileText className="size-5" />
                      {tForm("submit")}
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 p-4 bg-zinc-800 border border-zinc-700 rounded-lg">
                <p className="text-sm text-zinc-300">{tForm("note")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const CartItemRow = memo(function CartItemRow({ item }: { item: CartItem }) {
  const t = useTranslations("cart");
  const colorText = getCartItemColorText(item, t("colorNotSelected"));

  return (
    <div className="flex items-start gap-3 rounded-lg border border-zinc-700 bg-zinc-800 p-3 sm:items-center sm:gap-4 sm:p-4">
      <div className="relative size-20 flex-shrink-0 sm:size-16">
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
        <h3 className="mb-2 text-sm font-medium leading-snug text-white break-words sm:text-base">
          {item.product.name}
        </h3>
        <p className="text-xs leading-relaxed text-zinc-400 break-words sm:text-sm">
          {t("colorLabel")} {colorText} •{" "}
          {item.product.capacity?.name || t("notAvailable")}
        </p>
        <p className="text-xs leading-relaxed text-zinc-400 break-words sm:text-sm">
          {t("categoryLabel")}{" "}
          {item.product.productCategories
            ?.map((pc) => pc.category.name)
            .join(", ") || t("notAvailable")}
        </p>
      </div>
    </div>
  );
});
