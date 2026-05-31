import { AlertTriangle } from "lucide-react";
import { ModalBackdrop } from "@/components/admin/ModalBackdrop";

interface ConfirmModalProps {
  show: boolean;
  action: "delete" | "toggle";
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  showConfirmButton?: boolean;
  confirmLabel: string;
  cancelLabel?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ConfirmModal({
  show,
  action,
  title,
  subtitle,
  children,
  showConfirmButton = true,
  confirmLabel,
  cancelLabel = "Hủy",
  onCancel,
  onConfirm,
}: ConfirmModalProps) {
  if (!show) return null;

  return (
    <ModalBackdrop>
      <div className="bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div
              className={`size-10 rounded-full flex items-center justify-center ${
                action === "delete" ? "bg-red-100" : "bg-yellow-100"
              }`}
            >
              <AlertTriangle
                className={`size-5 ${
                  action === "delete" ? "text-red-600" : "text-yellow-600"
                }`}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
            </div>
          </div>

          <div className="mb-6">{children}</div>

          <div className="flex gap-3">
            <button type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            {showConfirmButton && (
              <button type="button"
                onClick={onConfirm}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors cursor-pointer ${
                  action === "delete"
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-yellow-600 hover:bg-yellow-700"
                }`}
              >
                {confirmLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </ModalBackdrop>
  );
}
