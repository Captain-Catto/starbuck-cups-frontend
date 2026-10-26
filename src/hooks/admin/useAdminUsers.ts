import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getAdminAuthHeaders } from "@/lib/admin-token";
import type { PaginationMeta } from "@/types";

export interface AdminAccount {
  id: string;
  username: string;
  email: string;
  roleId: string | null;
  adminRole?: { id: string; name: string; key: string | null };
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
}

export interface AdminUserFilters {
  search: string;
  roleId: string;
  status: "all" | "active" | "inactive";
}

export interface CreateAdminUserInput {
  username: string;
  email: string;
  roleId: string;
  password: string;
}

export interface RoleOption {
  id: string;
  name: string;
}

const PER_PAGE = 20;

interface ApiResult<T> {
  ok: boolean;
  data?: T;
  message?: string;
}

async function callApi<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  try {
    const response = await fetch(path, {
      ...init,
      headers: { "Content-Type": "application/json", ...getAdminAuthHeaders(), ...init?.headers },
    });
    const body = await response.json().catch(() => null);
    if (response.ok && body?.success) return { ok: true, data: body.data };
    const issue = Array.isArray(body?.error?.details) ? body.error.details[0]?.message : undefined;
    return { ok: false, message: issue || body?.error?.message || body?.message || "Có lỗi xảy ra" };
  } catch {
    return { ok: false, message: "Lỗi kết nối. Vui lòng thử lại." };
  }
}

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminAccount[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<AdminUserFilters>({ search: "", roleId: "", status: "all" });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(filters.search), 400);
    return () => clearTimeout(timer);
  }, [filters.search]);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    const params = new URLSearchParams({ page: String(page), limit: String(PER_PAGE) });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.roleId) params.set("roleId", filters.roleId);
    if (filters.status !== "all") params.set("isActive", String(filters.status === "active"));

    setLoading(true);
    const result = await callApi<{ items: AdminAccount[]; pagination: PaginationMeta }>(
      `/api/admin/users?${params}`,
      { signal: controller.signal }
    );
    if (controller.signal.aborted) return;

    if (result.ok && result.data) {
      setUsers(result.data.items);
      setPagination(result.data.pagination);
    } else {
      toast.error(result.message || "Không thể tải danh sách tài khoản");
    }
    setLoading(false);
  }, [page, debouncedSearch, filters.roleId, filters.status]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  // Roles for the filter and the role pickers
  useEffect(() => {
    let cancelled = false;
    callApi<{ items: RoleOption[] }>("/api/admin/roles").then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) setRoles(result.data.items);
      else toast.error(result.message || "Không thể tải danh sách vai trò");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const changeFilter = useCallback(<K extends keyof AdminUserFilters>(key: K, value: AdminUserFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const createUser = useCallback(async (input: CreateAdminUserInput): Promise<boolean> => {
    setActionLoading("create");
    const result = await callApi<AdminAccount>("/api/admin/users", { method: "POST", body: JSON.stringify(input) });
    setActionLoading(null);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success("Đã tạo tài khoản");
    await load();
    return true;
  }, [load]);

  const updateUser = useCallback(async (id: string, patch: { roleId?: string; isActive?: boolean }, successMessage: string) => {
    setActionLoading(id);
    const result = await callApi<AdminAccount>(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
    setActionLoading(null);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success(successMessage);
    await load();
    return true;
  }, [load]);

  const resetPassword = useCallback(async (id: string, password: string): Promise<boolean> => {
    setActionLoading(id);
    const result = await callApi<{ message: string }>(`/api/admin/users/${id}/reset-password`, {
      method: "POST",
      body: JSON.stringify({ password }),
    });
    setActionLoading(null);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success("Đã đặt lại mật khẩu");
    await load();
    return true;
  }, [load]);

  return {
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
  };
}
