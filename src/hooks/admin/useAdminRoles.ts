import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { getAdminAuthHeaders } from "@/lib/admin-token";

export interface AdminRoleItem {
  id: string;
  key: string | null;
  name: string;
  description: string | null;
  isSystem: boolean;
  permissions: string[];
  userCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface PermissionCatalogItem {
  key: string;
  module: string;
  label: string;
  superOnly?: boolean;
}

export interface PermissionCatalog {
  modules: Array<{ key: string; label: string }>;
  permissions: PermissionCatalogItem[];
}

export interface RoleInput {
  name: string;
  description: string;
  permissions: string[];
}

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

export function useAdminRoles() {
  const [roles, setRoles] = useState<AdminRoleItem[]>([]);
  const [catalog, setCatalog] = useState<PermissionCatalog | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;

    setLoading(true);
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    const result = await callApi<{ items: AdminRoleItem[] }>(`/api/admin/roles?${params}`, { signal: controller.signal });
    if (controller.signal.aborted) return;

    if (result.ok && result.data) setRoles(result.data.items);
    else toast.error(result.message || "Không thể tải danh sách vai trò");
    setLoading(false);
  }, [debouncedSearch]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
    return () => controllerRef.current?.abort();
  }, [load]);

  // The catalog is static for a session, load it once
  useEffect(() => {
    let cancelled = false;
    callApi<PermissionCatalog>("/api/admin/roles/permissions").then((result) => {
      if (cancelled) return;
      if (result.ok && result.data) setCatalog(result.data);
      else toast.error(result.message || "Không thể tải danh sách quyền");
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const saveRole = useCallback(async (id: string | null, input: RoleInput): Promise<boolean> => {
    setSaving(true);
    const result = await callApi<AdminRoleItem>(id ? `/api/admin/roles/${id}` : "/api/admin/roles", {
      method: id ? "PUT" : "POST",
      body: JSON.stringify(input),
    });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success(id ? "Đã cập nhật vai trò" : "Đã tạo vai trò");
    await load();
    return true;
  }, [load]);

  const deleteRole = useCallback(async (id: string): Promise<boolean> => {
    setSaving(true);
    const result = await callApi<{ message: string }>(`/api/admin/roles/${id}`, { method: "DELETE" });
    setSaving(false);
    if (!result.ok) {
      toast.error(result.message);
      return false;
    }
    toast.success("Đã xóa vai trò");
    await load();
    return true;
  }, [load]);

  return { roles, catalog, search, setSearch, loading, saving, saveRole, deleteRole };
}
