import { Pencil, Trash2 } from "lucide-react";
import { TableSkeletonRows } from "@/components/admin/TableSkeletonRows";
import type { AdminRoleItem } from "@/hooks/admin/useAdminRoles";

interface RolesTableProps {
  roles: AdminRoleItem[];
  loading: boolean;
  onEdit: (role: AdminRoleItem) => void;
  onDelete: (role: AdminRoleItem) => void;
}

const formatDate = (value: string) => new Date(value).toLocaleString("vi-VN");

export function RolesTable({ roles, loading, onEdit, onDelete }: RolesTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-gray-700 bg-gray-800">
      <table className="min-w-full divide-y divide-gray-700">
        <thead className="bg-gray-700">
          <tr>
            {["Tên vai trò", "Tài khoản", "Quyền", "Ngày cập nhật", "Thao tác"].map((heading, i) => (
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
          ) : roles.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-6 py-12 text-center text-gray-300">
                Không có vai trò nào
              </td>
            </tr>
          ) : (
            roles.map((role) => {
              const cannotDelete = role.isSystem || role.userCount > 0;
              return (
                <tr key={role.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-white">{role.name}</span>
                      {role.isSystem && (
                        <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 text-xs text-yellow-400">Role mẫu</span>
                      )}
                    </div>
                    {role.description && <div className="mt-1 text-sm text-gray-300">{role.description}</div>}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-300">{role.userCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{role.permissions.length}</td>
                  <td className="px-6 py-4 text-sm text-gray-300">{formatDate(role.updatedAt)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onEdit(role)}
                        title="Chỉnh sửa"
                        aria-label={`Chỉnh sửa ${role.name}`}
                        className="cursor-pointer rounded p-1 text-white hover:bg-gray-700"
                      >
                        <Pencil className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(role)}
                        disabled={cannotDelete}
                        title={
                          role.isSystem
                            ? "Không thể xóa vai trò mẫu"
                            : role.userCount > 0
                              ? "Đang có tài khoản dùng vai trò này"
                              : "Xóa"
                        }
                        aria-label={`Xóa ${role.name}`}
                        className="cursor-pointer rounded p-1 text-red-400 hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 className="size-4" />
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
