"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/admin/PageHeader";
import { Pagination } from "@/components/ui/Pagination";
import { AdminUsersTable } from "@/components/admin/users/AdminUsersTable";
import { CreateAdminUserModal } from "@/components/admin/users/CreateAdminUserModal";
import { ResetPasswordModal } from "@/components/admin/users/ResetPasswordModal";
import { ConfirmModal } from "@/components/admin/ConfirmModal";
import { useAdminUsers, type AdminAccount } from "@/hooks/admin/useAdminUsers";
import { useRole } from "@/hooks/useRole";
import { useAppSelector } from "@/store";
import { PERMISSIONS, getHomePath } from "@/lib/permissions";
import UsersLoading from "./loading";

type PendingAction =
  | { kind: "role"; user: AdminAccount; roleId: string }
  | { kind: "toggle"; user: AdminAccount };

export default function AdminUsersPage() {
  const router = useRouter();
  const { can, permissions } = useRole();
  const allowed = can(PERMISSIONS.USERS_MANAGE);
  const currentUserId = useAppSelector((state) => state.auth.user?.id);

  const {
    users,
    roles,
    pagination,
    filters,
    loading,
    actionLoading,
    changeFilter,
    setPage,
    createUser,
    updateUser,
    resetPassword,
  } = useAdminUsers();

  const [showCreate, setShowCreate] = useState(false);
  const [resetTarget, setResetTarget] = useState<AdminAccount | null>(null);
  const [pending, setPending] = useState<PendingAction | null>(null);

  // The API refuses everyone without users.manage anyway
  useEffect(() => {
    if (!allowed) router.replace(getHomePath(permissions));
  }, [allowed, permissions, router]);

  if (!allowed) return <UsersLoading />;

  const confirmPending = async () => {
    if (!pending) return;
    if (pending.kind === "role") {
      await updateUser(pending.user.id, { roleId: pending.roleId }, "Đã đổi vai trò");
    } else {
      const activate = !pending.user.isActive;
      await updateUser(pending.user.id, { isActive: activate }, activate ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản");
    }
    setPending(null);
  };

  const pendingMessage = pending
    ? pending.kind === "role"
      ? `Đổi vai trò của ${pending.user.username} thành ${roles.find((r) => r.id === pending.roleId)?.name ?? "vai trò mới"}? Tài khoản này sẽ bị đăng xuất khỏi mọi thiết bị.`
      : pending.user.isActive
        ? `Khóa tài khoản ${pending.user.username}? Họ sẽ bị đăng xuất ngay và không đăng nhập được nữa.`
        : `Mở khóa tài khoản ${pending.user.username}?`
    : "";

  return (
    <div className="min-h-screen space-y-6 bg-gray-900 p-6">
      <PageHeader
        title="Quản lý tài khoản"
        description="Tạo tài khoản và phân quyền đăng nhập vào trang quản trị"
        action={
          <button
            type="button"
            onClick={() => setShowCreate(true)}
            className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700"
          >
            <Plus className="size-4" />
            Tạo tài khoản
          </button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          aria-label="Tìm tài khoản"
          placeholder="Tìm theo tên hoặc email…"
          value={filters.search}
          onChange={(e) => changeFilter("search", e.target.value)}
          className="w-full rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white sm:w-72"
        />
        <select
          aria-label="Lọc theo vai trò"
          value={filters.roleId}
          onChange={(e) => changeFilter("roleId", e.target.value)}
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
        >
          <option value="">Tất cả vai trò</option>
          {roles.map((r) => (
            <option key={r.id} value={r.id}>{r.name}</option>
          ))}
        </select>
        <select
          aria-label="Lọc theo trạng thái"
          value={filters.status}
          onChange={(e) => changeFilter("status", e.target.value as "all" | "active" | "inactive")}
          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-2 text-white"
        >
          <option value="all">Mọi trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
      </div>

      <AdminUsersTable
        users={users}
        roles={roles}
        loading={loading}
        actionLoading={actionLoading}
        currentUserId={currentUserId}
        onChangeRole={(user, roleId) => setPending({ kind: "role", user, roleId })}
        onToggleActive={(user) => setPending({ kind: "toggle", user })}
        onResetPassword={setResetTarget}
      />

      {pagination && pagination.total_pages > 1 && (
        <Pagination data={pagination} onPageChange={setPage} />
      )}

      {showCreate && (
        <CreateAdminUserModal
          roles={roles}
          loading={actionLoading === "create"}
          onClose={() => setShowCreate(false)}
          onSubmit={createUser}
        />
      )}

      {resetTarget && (
        <ResetPasswordModal
          username={resetTarget.username}
          loading={actionLoading === resetTarget.id}
          onClose={() => setResetTarget(null)}
          onSubmit={(password) => resetPassword(resetTarget.id, password)}
        />
      )}

      <ConfirmModal
        show={pending !== null}
        action="toggle"
        title="Xác nhận"
        confirmLabel={actionLoading ? "Đang xử lý…" : "Xác nhận"}
        onCancel={() => setPending(null)}
        onConfirm={confirmPending}
      >
        <p className="text-gray-300">{pendingMessage}</p>
      </ConfirmModal>
    </div>
  );
}
