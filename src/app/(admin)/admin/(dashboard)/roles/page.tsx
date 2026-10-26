"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { RolesTable } from "@/components/admin/roles/RolesTable";
import { RoleFormModal } from "@/components/admin/roles/RoleFormModal";
import { useAdminRoles, type AdminRoleItem } from "@/hooks/admin/useAdminRoles";
import { useRole } from "@/hooks/useRole";
import { PERMISSIONS, getHomePath } from "@/lib/permissions";
import RolesLoading from "./loading";

type FormTarget = { role: AdminRoleItem | null };

export default function AdminRolesPage() {
  const router = useRouter();
  const { can, permissions } = useRole();
  const allowed = can(PERMISSIONS.ROLES_MANAGE);

  const { roles, catalog, search, setSearch, loading, saving, saveRole, deleteRole } = useAdminRoles();
  const [form, setForm] = useState<FormTarget | null>(null);
  const [deleting, setDeleting] = useState<AdminRoleItem | null>(null);

  // The API refuses everyone without roles.manage anyway
  useEffect(() => {
    if (!allowed) router.replace(getHomePath(permissions));
  }, [allowed, permissions, router]);

  if (!allowed) return <RolesLoading />;

  return (
    <div className="min-h-screen space-y-6 bg-gray-900 p-6">
      <PageHeader
        title="Vai trò & Quyền"
        description="Tạo vai trò và chọn quyền cho từng nhóm tài khoản"
        action={
          <button
            type="button"
            onClick={() => setForm({ role: null })}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            <Plus className="size-4" />
            Thêm mới
          </button>
        }
      />

      <input
        type="search"
        aria-label="Tìm vai trò"
        placeholder="Tìm kiếm…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white sm:w-72"
      />

      <RolesTable roles={roles} loading={loading} onEdit={(role) => setForm({ role })} onDelete={setDeleting} />

      {form && (
        <RoleFormModal
          // remount per target so the form starts from that role's values
          key={form.role?.id ?? "new"}
          role={form.role}
          catalog={catalog}
          saving={saving}
          onClose={() => setForm(null)}
          onSubmit={(input) => saveRole(form.role?.id ?? null, input)}
        />
      )}

      <ConfirmModal
        show={deleting !== null}
        action="delete"
        title="Xóa vai trò"
        confirmLabel={saving ? "Đang xóa…" : "Xóa"}
        onCancel={() => setDeleting(null)}
        onConfirm={async () => {
          if (deleting && (await deleteRole(deleting.id))) setDeleting(null);
        }}
      >
        <p className="text-gray-300">Xóa vai trò {deleting?.name}? Hành động này không thể hoàn tác.</p>
      </ConfirmModal>
    </div>
  );
}
