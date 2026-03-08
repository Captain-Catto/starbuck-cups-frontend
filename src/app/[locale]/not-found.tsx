"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { Home, Search, AlertCircle } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("notFound");
  const tCommon = useTranslations("common");

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        <div className="text-6xl font-bold text-white mb-4">404</div>

        <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>

        <p className="text-gray-300 mb-8">{t("description")}</p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 border border-gray-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            {tCommon("backToHome")}
          </Link>

          <Link
            href="/products"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Search className="w-4 h-4" />
            {tCommon("viewProducts")}
          </Link>
        </div>
      </div>
    </div>
  );
}
