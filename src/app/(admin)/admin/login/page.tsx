"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import { loginAdmin } from "@/store/slices/authSlice";
import { useStandardAuth } from "@/hooks/useStandardAuth";
import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { isAuthenticated, isReady } = useStandardAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.push("/admin/dashboard");
    }
  }, [isReady, isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const result = await dispatch(loginAdmin(formData));
      if (loginAdmin.fulfilled.match(result)) {
        toast.success("Đăng nhập thành công!");
        router.push("/admin/dashboard");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(`Đăng nhập thất bại. Vui lòng thử lại. ${error.message} `);
      } else {
        toast.error(`Đăng nhập thất bại. Vui lòng thử lại. ${String(error)} `);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo & Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center mb-4 border border-gray-700">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-white">
            Đăng nhập để quản lý hệ thống H&apos;s shoucangpu
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-gray-800 rounded-2xl border border-gray-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-3 p-4 bg-gray-700 border border-gray-600 rounded-lg">
                <AlertCircle className="w-5 h-5 text-white flex-shrink-0" />
                <p className="text-sm text-white">{error}</p>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-white mb-2"
              >
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-white" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  placeholder="admin@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-12 py-3 border border-gray-600 bg-gray-700 text-white placeholder-gray-400 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-white hover:text-gray-300" />
                  ) : (
                    <Eye className="h-5 w-5 text-white hover:text-gray-300" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember"
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="h-4 w-4 text-white focus:ring-gray-500 border-gray-600 bg-gray-700 rounded"
                />
                <label
                  htmlFor="remember"
                  className="ml-2 block text-sm text-white"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>
              <button
                type="button"
                className="text-sm text-white hover:text-gray-300 font-medium"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 border border-gray-600 rounded-lg shadow-sm text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Đang đăng nhập...
                </div>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-white">
          <p>© 2024 H&apos;s shoucangpu Admin Panel</p>
        </div>
      </div>
    </div>
  );
}
