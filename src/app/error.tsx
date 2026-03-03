"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {

  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Có lỗi xảy ra
        </h1>

        <p className="text-gray-600 mb-8">
          Chúng tôi đang gặp một số vấn đề kỹ thuật. Xin lỗi vì sự bất tiện này.
        </p>

        <div className="space-y-3">
          <button
            onClick={reset}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Thử lại
          </button>

          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
        </div>

        {process.env.NODE_ENV === "development" && (
          <details className="mt-8 text-left">
            <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
              Chi tiết lỗi (development only)
            </summary>
            <pre className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto text-red-600 whitespace-pre-wrap">
              {error.message}
              {error.stack && `\n\n${error.stack}`}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}
