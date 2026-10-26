"use client";

import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { ModalBackdrop } from "@/components/admin/ModalBackdrop";
import { generateTempPassword } from "@/lib/admin-roles";
import type { CreateAdminUserInput, RoleOption } from "@/hooks/admin/useAdminUsers";

interface CreateAdminUserModalProps {
  roles: RoleOption[];
  loading: boolean;
  onClose: () => void;
  onSubmit: (input: CreateAdminUserInput) => Promise<boolean>;
}

export function CreateAdminUserModal({ roles, loading, onClose, onSubmit }: CreateAdminUserModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [roleId, setRoleId] = useState(() => roles.find((r) => r.name === "Nhân viên")?.id ?? roles[0]?.id ?? "");
  const [password, setPassword] = useState(() => generateTempPassword());
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) return setError("Tên đăng nhập tối thiểu 3 ký tự");
    if (!email.trim()) return setError("Vui lòng nhập email");
    if (!roleId) return setError("Vui lòng chọn vai trò");
    setError("");
    if (await onSubmit({ username: username.trim(), email: email.trim(), roleId, password })) onClose();
  };

  return (
    <ModalBackdrop className="p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Tạo tài khoản</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="cursor-pointer text-gray-300 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <label className="block text-sm text-gray-300">
          Tên đăng nhập
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-gray-300">
          Email đăng nhập
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="off"
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-gray-300">
          Vai trò
          <select
            value={roleId}
            onChange={(e) => setRoleId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
          >
            {roles.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>
        </label>

        <div className="text-sm text-gray-300">
          <label htmlFor="temp-password">Mật khẩu tạm</label>
          <div className="mt-1 flex gap-2">
            <input
              id="temp-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              className="w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 font-mono text-white"
            />
            <button
              type="button"
              onClick={() => setPassword(generateTempPassword())}
              aria-label="Tạo mật khẩu mới"
              className="cursor-pointer rounded-lg border border-gray-600 px-3 text-gray-200 hover:bg-gray-700"
            >
              <RefreshCw className="size-4" />
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Hãy gửi mật khẩu này cho người dùng. Họ sẽ phải đổi mật khẩu ở lần đăng nhập đầu tiên.
          </p>
        </div>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-700">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang tạo…" : "Tạo tài khoản"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}
