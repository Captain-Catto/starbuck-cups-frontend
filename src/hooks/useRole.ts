import { useCallback } from "react";
import { useAppSelector } from "@/store";

/**
 * Permissions of the signed-in admin. The backend enforces them on every request; this only
 * drives what the UI shows.
 */
export function useRole() {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.permissions;

  /** True when the account holds ANY of the given permissions. */
  const can = useCallback(
    (...required: string[]) => Boolean(permissions && required.some((key) => permissions.includes(key))),
    [permissions]
  );

  return {
    can,
    permissions: permissions ?? [],
    roleName: user?.roleName,
    mustChangePassword: Boolean(user?.mustChangePassword),
  };
}
