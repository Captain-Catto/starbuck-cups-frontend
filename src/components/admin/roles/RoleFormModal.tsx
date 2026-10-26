"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { ModalBackdrop } from "@/components/admin/ModalBackdrop";
import { PermissionTransfer } from "@/components/admin/roles/PermissionTransfer";
import type { AdminRoleItem, PermissionCatalog, RoleInput } from "@/hooks/admin/useAdminRoles";

interface RoleFormModalProps {
  /** null when creating a role */
  role: AdminRoleItem | null;
  catalog: PermissionCatalog | null;
  saving: boolean;
  onClose: () => void;
  onSubmit: (input: RoleInput) => Promise<boolean>;
}

export function RoleFormModal({ role, catalog, saving, onClose, onSubmit }: RoleFormModalProps) {
  const [name, setName] = useState(role?.name ?? "");
  const [description, setDescription] = useState(role?.description ?? "");
  const [permissions, setPermissions] = useState<string[]>(role?.permissions ?? []);
  const [error, setError] = useState("");

  const locked = role?.key === "SUPER_ADMIN";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) return setError("Tên vai trò tối thiểu 2 ký tự");
    setError("");
    if (await onSubmit({ name: name.trim(), description: description.trim(), permissions })) onClose();
  };

  return (
    <ModalBackdrop className="p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-4xl space-y-4 overflow-y-auto rounded-lg border border-gray-700 bg-gray-800 p-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">{role ? "Cập nhật vai trò" : "Thêm vai trò"}</h2>
          <button type="button" onClick={onClose} aria-label="Đóng" className="cursor-pointer text-gray-300 hover:text-white">
            <X className="size-5" />
          </button>
        </div>

        <label className="block text-sm text-gray-300">
          Tên vai trò <span className="text-red-400">*</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
          />
        </label>

        <label className="block text-sm text-gray-300">
          Mô tả
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={255}
            className="mt-1 w-full rounded-lg border border-gray-600 bg-gray-900 px-3 py-2 text-white"
          />
        </label>

        <div>
          <p className="mb-2 text-sm text-gray-300">Phân quyền</p>
          {role?.isSystem && (
            <p className="mb-3 rounded-lg border border-blue-500/40 bg-blue-500/10 p-3 text-sm text-blue-200">
              {locked
                ? "Vai trò mẫu Super Admin luôn có toàn bộ quyền, chỉ đổi được tên và mô tả."
                : "Vai trò mẫu: bạn có thể đổi tên và chỉnh quyền, nhưng không xóa được."}
            </p>
          )}
          {catalog ? (
            <PermissionTransfer catalog={catalog} value={permissions} onChange={setPermissions} disabled={locked} />
          ) : (
            <div className="h-72 animate-pulse rounded-lg border border-gray-700 bg-gray-900" aria-busy="true" />
          )}
        </div>

        {error && <p className="text-sm text-red-400" role="alert">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="cursor-pointer rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-700">
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving || !catalog}
            className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 disabled:opacity-50"
          >
            {saving ? "Đang lưu…" : "Đồng ý"}
          </button>
        </div>
      </form>
    </ModalBackdrop>
  );
}
