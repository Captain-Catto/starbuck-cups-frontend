import { LayoutDashboard, RefreshCw } from "lucide-react";
import { useAppSelector } from "@/store";

interface WelcomeSectionProps {
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

export function WelcomeSection({
  loading,
  error,
  onRefresh,
}: WelcomeSectionProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-2xl p-6 text-white border border-gray-600">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">
            Chào mừng trở lại, {user?.name || "Admin"}! 👋
          </h1>
          <p className="text-gray-300">
            Đây là tổng quan về hoạt động hôm nay của hệ thống
          </p>
          {error && <p className="text-red-300 text-sm mt-2">{error}</p>}
        </div>
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="p-3 bg-gray-700/50 hover:bg-gray-600/50 rounded-xl transition-colors disabled:opacity-50 border border-gray-600 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw
              className={`w-5 h-5 text-gray-300 ${
                loading ? "animate-spin" : ""
              }`}
            />
          </button>
          <div className="w-20 h-20 bg-gray-700/50 rounded-2xl flex items-center justify-center border border-gray-600">
            <LayoutDashboard className="w-10 h-10 text-gray-300" />
          </div>
        </div>
      </div>
    </div>
  );
}
