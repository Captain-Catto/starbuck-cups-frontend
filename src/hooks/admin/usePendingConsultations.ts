import { useCallback, useEffect, useReducer } from "react";
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

interface PendingConsultationsState {
  pendingCount: number;
  loading: boolean;
  error: string | null;
}

type PendingConsultationsAction =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; payload: number }
  | { type: "FETCH_ERROR"; payload: string }
  | { type: "NO_TOKEN" };

const initialPendingConsultationsState: PendingConsultationsState = {
  pendingCount: 0,
  loading: true,
  error: null,
};

function pendingConsultationsReducer(
  state: PendingConsultationsState,
  action: PendingConsultationsAction
): PendingConsultationsState {
  switch (action.type) {
    case "FETCH_START":
      return { ...state, loading: true, error: null };
    case "FETCH_SUCCESS":
      return { pendingCount: action.payload, loading: false, error: null };
    case "FETCH_ERROR":
      return { ...state, loading: false, error: action.payload };
    case "NO_TOKEN":
      return { ...state, loading: false };
    default:
      return state;
  }
}

export function usePendingConsultations() {
  const [{ pendingCount, loading, error }, dispatch] = useReducer(
    pendingConsultationsReducer,
    initialPendingConsultationsState
  );

  const token = useAppSelector((state) => state.auth.token);

  const fetchPendingCount = useCallback(async () => {
    if (!token) {
      dispatch({ type: "NO_TOKEN" });
      return;
    }

    try {
      dispatch({ type: "FETCH_START" });

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
        const count =
          typeof data.data === "number" ? data.data : data.data.count;
        dispatch({ type: "FETCH_SUCCESS", payload: count });
      } else {
        throw new Error(
          data.error?.message || "Failed to fetch pending consultations count"
        );
      }
    } catch (err) {
      dispatch({
        type: "FETCH_ERROR",
        payload: err instanceof Error ? err.message : "Unknown error occurred",
      });
    }
  }, [token]);

  useEffect(() => {
    fetchPendingCount();
  }, [fetchPendingCount]);

  return {
    pendingCount,
    loading,
    error,
    refetch: fetchPendingCount,
  };
}
