import { toast } from "sonner";

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

export class AppError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number = 500, code?: string) {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function handleApiError(error: unknown, customMessage?: string): void {
  let errorMessage = customMessage || "Có lỗi xảy ra. Vui lòng thử lại.";

  if (error instanceof AppError) {
    errorMessage = error.message;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  }

  toast.error(errorMessage);
}

export function showSuccess(message: string): void {
  toast.success(message);
}

export function showInfo(message: string): void {
  toast.info(message);
}

export function showWarning(message: string): void {
  toast.warning(message);
}

export async function handleAsyncOperation<T>(
  operation: () => Promise<T>,
  {
    successMessage,
    errorMessage,
    loadingMessage,
  }: {
    successMessage?: string;
    errorMessage?: string;
    loadingMessage?: string;
  } = {}
): Promise<T | null> {
  let toastId: string | number | undefined;

  try {
    if (loadingMessage) {
      toastId = toast.loading(loadingMessage);
    }

    const result = await operation();

    if (toastId) {
      toast.dismiss(toastId);
    }

    if (successMessage) {
      toast.success(successMessage);
    }

    return result;
  } catch (error) {
    if (toastId) {
      toast.dismiss(toastId);
    }

    handleApiError(error, errorMessage);
    return null;
  }
}

export const apiUtils = {
  handleError: handleApiError,
  showSuccess,
  showInfo,
  showWarning,
  handleAsyncOperation,
};
