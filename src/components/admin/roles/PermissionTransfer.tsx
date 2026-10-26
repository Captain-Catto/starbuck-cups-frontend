"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import type { PermissionCatalog, PermissionCatalogItem } from "@/hooks/admin/useAdminRoles";

interface PermissionTransferProps {
  catalog: PermissionCatalog;
  value: string[];
  onChange: (next: string[]) => void;
  /** Locked roles (Super Admin) hold every permission and cannot be edited. */
  disabled?: boolean;
}

interface PanelProps {
  title: string;
  items: PermissionCatalogItem[];
  modules: PermissionCatalog["modules"];
  checked: Set<string>;
  onToggle: (key: string) => void;
  onToggleMany: (keys: string[], on: boolean) => void;
  disabled?: boolean;
  empty: string;
}

function Panel({ title, items, modules, checked, onToggle, onToggleMany, disabled, empty }: PanelProps) {
  const [query, setQuery] = useState("");

  const groups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const visible = needle ? items.filter((p) => p.label.toLowerCase().includes(needle) || p.key.includes(needle)) : items;
    return modules
      .map((m) => ({ module: m, permissions: visible.filter((p) => p.module === m.key) }))
      .filter((g) => g.permissions.length > 0);
  }, [items, modules, query]);

  return (
    <div className="flex min-h-72 flex-1 flex-col rounded-lg border border-gray-600 bg-gray-900">
      <div className="border-b border-gray-700 px-3 py-2 text-sm font-medium text-white">
        {title} <span className="text-gray-400">({items.length})</span>
      </div>
      <div className="relative border-b border-gray-700 p-2">
        <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gray-400" aria-hidden="true" />
        <input
          type="search"
          aria-label={`Tìm trong ${title}`}
          placeholder="Tìm quyền…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-md border border-gray-600 bg-gray-800 py-1.5 pl-8 pr-2 text-sm text-white"
        />
      </div>
      <div className="max-h-72 flex-1 overflow-y-auto p-2">
        {groups.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{empty}</p>
        ) : (
          groups.map(({ module, permissions }) => {
            const keys = permissions.map((p) => p.key);
            const allChecked = keys.every((k) => checked.has(k));
            return (
              <div key={module.key} className="mb-2">
                <label className="flex cursor-pointer items-center gap-2 px-1 py-1 text-xs font-semibold uppercase tracking-wide text-gray-300">
                  <input
                    type="checkbox"
                    checked={allChecked}
                    disabled={disabled}
                    onChange={(e) => onToggleMany(keys, e.target.checked)}
                    aria-label={`Chọn tất cả ${module.label}`}
                    className="rounded border-gray-500"
                  />
                  {module.label}
                </label>
                {permissions.map((p) => (
                  <label key={p.key} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm text-gray-100 hover:bg-gray-800">
                    <input
                      type="checkbox"
                      checked={checked.has(p.key)}
                      disabled={disabled}
                      onChange={() => onToggle(p.key)}
                      className="rounded border-gray-500"
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export function PermissionTransfer({ catalog, value, onChange, disabled = false }: PermissionTransferProps) {
  const [leftChecked, setLeftChecked] = useState<Set<string>>(new Set());
  const [rightChecked, setRightChecked] = useState<Set<string>>(new Set());

  const selected = useMemo(() => new Set(value), [value]);
  const chosen = catalog.permissions.filter((p) => selected.has(p.key));
  // Account and role management stay with Super Admin, so they are never offered to other roles
  const available = catalog.permissions.filter((p) => !selected.has(p.key) && !p.superOnly);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void) => (key: string) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setter(next);
  };
  const toggleMany = (set: Set<string>, setter: (s: Set<string>) => void) => (keys: string[], on: boolean) => {
    const next = new Set(set);
    keys.forEach((k) => (on ? next.add(k) : next.delete(k)));
    setter(next);
  };

  const addChecked = () => {
    onChange([...value, ...rightChecked]);
    setRightChecked(new Set());
  };
  const removeChecked = () => {
    onChange(value.filter((k) => !leftChecked.has(k)));
    setLeftChecked(new Set());
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-stretch">
      <Panel
        title="Quyền đã chọn"
        items={chosen}
        modules={catalog.modules}
        checked={leftChecked}
        onToggle={toggle(leftChecked, setLeftChecked)}
        onToggleMany={toggleMany(leftChecked, setLeftChecked)}
        disabled={disabled}
        empty="Chưa có quyền nào"
      />

      <div className="flex items-center justify-center gap-2 md:flex-col">
        <button
          type="button"
          onClick={removeChecked}
          disabled={disabled || leftChecked.size === 0}
          aria-label="Bỏ các quyền đã tick"
          className="cursor-pointer rounded-lg border border-gray-600 p-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="size-4 rotate-90 md:rotate-0" />
        </button>
        <button
          type="button"
          onClick={addChecked}
          disabled={disabled || rightChecked.size === 0}
          aria-label="Thêm các quyền đã tick"
          className="cursor-pointer rounded-lg border border-gray-600 p-2 text-white hover:bg-gray-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="size-4 rotate-90 md:rotate-0" />
        </button>
      </div>

      <Panel
        title="Quyền có thể thêm"
        items={available}
        modules={catalog.modules}
        checked={rightChecked}
        onToggle={toggle(rightChecked, setRightChecked)}
        onToggleMany={toggleMany(rightChecked, setRightChecked)}
        disabled={disabled}
        empty="Đã chọn hết các quyền"
      />
    </div>
  );
}
