"use client";

import { useState } from "react";
import { toast } from "sonner";
import { PageHeader } from "@/components/admin/PageHeader";
import { useAppDispatch, useAppSelector } from "@/store";
import { passwordChanged } from "@/store/slices/authSlice";
import { getAdminAuthHeaders } from "@/lib/admin-token";
import { useRole } from "@/hooks/useRole";

const PASSWORD_RULES =
  "Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.";

export default function AdminProfilePage() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { mustChangePassword, roleName } = useRole();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Mật khẩu xác nhận không khớp");
    if (newPassword === currentPassword) return setError("Mật khẩu mới phải khác mật khẩu hiện tại");

    setError("");
    setSaving(true);
    try {
      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAdminAuthHeaders() },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const body = await response.json().catch(() => null);

      if (response.ok && body?.success) {
        toast.success("Đã đổi mật khẩu");
        dispatch(passwordChanged());
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else if (body?.error?.code === "WEAK_PASSWORD") {
        setError(PASSWORD_RULES);
      } else if (body?.error?.code === "INCORRECT_PASSWORD") {
        setError("Mật khẩu hiện tại không đúng");
      } else {
        setError(body?.error?.message || body?.message || "Không thể đổi mật khẩu");
      }
    } catch {
      setError("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white";

  return (
    <div className="min-h-screen space-y-6 bg-gray-900 p-6">
      <PageHeader title="Hồ sơ của tôi" description="Thông tin tài khoản và đổi mật khẩu" />

      <div className="mx-auto max-w-xl space-y-6">
        {mustChangePassword && (
          <div role="alert" className="rounded-lg border border-yellow-600 bg-yellow-500/10 p-4 text-sm text-yellow-300">
            Bạn đang dùng mật khẩu tạm. Hãy đặt mật khẩu mới để tiếp tục sử dụng trang quản trị.
          </div>
        )}

        <div className="rounded-lg border border-gray-700 bg-gray-800 p-6">
          <dl className="space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">Tên đăng nhập</dt>
              <dd className="text-white">{user?.name}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">Email</dt>
              <dd className="text-white">{user?.email}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-gray-400">Vai trò</dt>
              <dd className="text-white">{roleName ?? user?.role}</dd>
            </div>
          </dl>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-6">
          <h2 className="text-lg font-semibold text-white">Đổi mật khẩu</h2>

          <label className="block text-sm text-gray-300">
            Mật khẩu hiện tại
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </label>

          <label className="block text-sm text-gray-300">
            Mật khẩu mới
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={inputClass}
            />
          </label>
          <p className="-mt-2 text-xs text-gray-400">{PASSWORD_RULES}</p>

          <label className="block text-sm text-gray-300">
            Nhập lại mật khẩu mới
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              required
              className={inputClass}
            />
          </label>

          {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : "Đổi mật khẩu"}
          </button>
        </form>
      </div>
    </div>
  );
}
