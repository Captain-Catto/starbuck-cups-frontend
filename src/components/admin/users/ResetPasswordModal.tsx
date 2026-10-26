"use client";

import { useState } from "react";
import { RefreshCw, X } from "lucide-react";
import { ModalBackdrop } from "@/components/admin/ModalBackdrop";
import { generateTempPassword } from "@/lib/admin-roles";

interface ResetPasswordModalProps {
  username: string;
  loading: boolean;
  onClose: () => void;
  onSubmit: (password: string) => Promise<boolean>;
}

export function ResetPasswordModal({ username, loading, onClose, onSubmit }: ResetPasswordModalProps) {
  const [password, setPassword] = useState(() => generateTempPassword());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (await onSubmit(password)) onClose();
  };

  return (
    <ModalBackdrop className="p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4 rounded-lg border border-gray-700 bg-gray-800 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Đặt lại mật khẩu</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="cursor-pointer text-gray-300 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <p className="text-sm text-gray-300">
          Đặt mật khẩu tạm mới cho <span className="font-medium text-white">{username}</span>. Mọi phiên đăng nhập
          hiện tại của tài khoản này sẽ bị đăng xuất và họ phải đổi mật khẩu khi đăng nhập lại.
        </p>

        <div className="flex gap-2">
          <input
            aria-label="Mật khẩu tạm"
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

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-700">
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Đang lưu…" : "Đặt lại mật khẩu"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}
