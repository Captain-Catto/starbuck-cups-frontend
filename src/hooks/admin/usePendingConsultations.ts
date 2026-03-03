import { useState, useEffect } from "react";
import { useAppSelector } from "@/store";

export interface PendingConsultationsResponse {
  success: boolean;
  data: number | { count: number };
  meta: {
    timestamp: string;
  };
  error?: {
    message: string;
    code: string;
  };
}

export function usePendingConsultations() {
  const [pendingCount, setPendingCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const token = useAppSelector((state) => state.auth.token);

  const fetchPendingCount = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/consultations/pending/count", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data: PendingConsultationsResponse = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error?.message || "Failed to fetch pending consultations count"
        );
      }

      if (data.success) {
        // Handle both formats: direct number or {count: number}
        const count =
          typeof data.data === "number" ? data.data : data.data.count;
        setPendingCount(count);
      } else {
        throw new Error(
          data.error?.message || "Failed to fetch pending consultations count"
        );
      }
    } catch (err) {

      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingCount();
    // Chỉ fetch một lần khi mount, không polling
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return {
    pendingCount,
    loading,
    error,
    refetch: fetchPendingCount,
  };
}
