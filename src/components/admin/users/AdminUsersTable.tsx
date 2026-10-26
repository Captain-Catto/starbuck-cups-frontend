import { Ban, CheckCircle2, KeyRound } from "lucide-react";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";
import type { AdminAccount, RoleOption } from "@/hooks/admin/useAdminUsers";

interface AdminUsersTableProps {
  users: AdminAccount[];
  roles: RoleOption[];
  loading: boolean;
  actionLoading: string | null;
  currentUserId: string | undefined;
  onChangeRole: (user: AdminAccount, roleId: string) => void;
  onToggleActive: (user: AdminAccount) => void;
  onResetPassword: (user: AdminAccount) => void;
}

function formatDate(value: string | null) {
  return value ? new Date(value).toLocaleString("vi-VN") : "Chưa đăng nhập";
}

export function AdminUsersTable({
  users,
  roles,
  loading,
  actionLoading,
  currentUserId,
  onChangeRole,
  onToggleActive,
  onResetPassword,
}: AdminUsersTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {["Tài khoản", "Vai trò", "Trạng thái", "Đăng nhập gần nhất", "Thao tác"].map((heading, i) => (
              <th
                key={heading}
                className={`px-6 py-3 text-xs font-medium uppercase tracking-wider text-white ${i === 4 ? "text-right" : "text-left"}`}
              >
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {loading ? (
            <TableSkeletonRows colSpan={5} />
          ) : users.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-300">
                Không có tài khoản nào
              </td>
            </tr>
          ) : (
            users.map((user) => {
              const isSelf = user.id === currentUserId;
              const busy = actionLoading === user.id;
              return (
                <tr key={user.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white">
                      {user.username}
                      {isSelf && <span className="ml-2 text-xs text-gray-400">(bạn)</span>}
                    </div>
                    <div className="text-sm text-gray-300">{user.email}</div>
                    {user.mustChangePassword && (
                      <div className="mt-1 text-xs text-yellow-400">Chờ đổi mật khẩu tạm</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <select
                      aria-label={`Vai trò của ${user.username}`}
                      value={user.roleId ?? ""}
                      disabled={isSelf || busy}
                      onChange={(e) => onChangeRole(user, e.target.value)}
                      className="rounded-lg border border-gray-600 bg-gray-900 px-2 py-1 text-sm text-white disabled:opacity-50"
                    >
                      {!user.roleId && <option value="">Chưa có vai trò</option>}
                      {roles.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.isActive ? "bg-green-500/15 text-green-400" : "bg-red-500/15 text-red-400"
                      }`}
                    >
                      {user.isActive ? "Đang hoạt động" : "Đã khóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatDate(user.lastLoginAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onResetPassword(user)}
                        disabled={isSelf || busy}
                        title="Đặt lại mật khẩu"
                        aria-label={`Đặt lại mật khẩu của ${user.username}`}
                        className="cursor-pointer rounded p-1 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <KeyRound className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onToggleActive(user)}
                        disabled={isSelf || busy}
                        title={user.isActive ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                        aria-label={user.isActive ? `Khóa ${user.username}` : `Mở khóa ${user.username}`}
                        className="cursor-pointer rounded p-1 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {user.isActive ? <Ban className="size-4" /> : <CheckCircle2 className="size-4" />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
