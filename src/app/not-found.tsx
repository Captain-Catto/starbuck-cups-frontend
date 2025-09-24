import Link from "next/link";
import { Home, Search, AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="mb-6">
          <div className="mx-auto w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center border border-gray-700">
            <AlertCircle className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* 404 Number */}
        <div className="text-6xl font-bold text-white mb-4">404</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white mb-2">
          Không tìm thấy trang
        </h1>

        {/* Description */}
        <p className="text-gray-300 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 border border-gray-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>

          <Link
            href="/products"
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <Search className="w-4 h-4" />
            Xem sản phẩm
          </Link>
        </div>
      </div>
    </div>
  );
}
