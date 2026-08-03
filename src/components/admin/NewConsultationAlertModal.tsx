"use client";

import { Bell, MessageSquare } from "lucide-react";
import { useConsultationAlertQueue } from "@/hooks/useConsultationAlertQueue";

const formatTime = (timestamp: string) =>
  new Date(timestamp).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

// Full-screen, must-confirm alert — deliberately has no backdrop-click or
// Escape dismissal. The bell icon's shake/badge is easy to miss or mistake
// for a false alarm; this forces an explicit acknowledgement so a new
// customer consultation can't slip by unnoticed.
export function NewConsultationAlertModal() {
  const { current, consultationData, remainingCount, acknowledge, viewDetails } =
    useConsultationAlertQueue();

  if (!current) return null;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="consultation-alert-title"
    >
      <div className="w-full max-w-md rounded-2xl border-2 border-white bg-gray-900 p-6 shadow-2xl animate-in fade-in zoom-in-95">
        <div className="flex items-center gap-3">
          <div className="relative flex size-12 flex-shrink-0 items-center justify-center rounded-full bg-white/10">
            <span className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
            <Bell className="relative size-6 text-white" />
          </div>
          <div>
            <h2 id="consultation-alert-title" className="text-lg font-bold text-white">
              Có khách hàng cần tư vấn!
            </h2>
            <span className="text-xs text-gray-400">{formatTime(current.timestamp)}</span>
          </div>
        </div>

        <div className="mt-4 space-y-2 rounded-lg bg-gray-800 p-4">
          {consultationData?.customerName && (
            <p className="text-sm text-white">
              <span className="text-gray-400">Khách hàng: </span>
              <span className="font-medium">{consultationData.customerName}</span>
            </p>
          )}
          {consultationData?.items !== undefined && (
            <p className="text-sm text-white">
              <span className="text-gray-400">Số sản phẩm: </span>
              <span className="font-medium">{consultationData.items}</span>
            </p>
          )}
          <p className="text-sm text-gray-300">{current.message}</p>
        </div>

        {remainingCount > 0 && (
          <p className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
            <MessageSquare className="size-3.5" />
            Còn {remainingCount} tin tư vấn khác đang chờ xác nhận
          </p>
        )}

        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={() => acknowledge(current.id)}
            className="flex-1 rounded-lg border border-gray-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 cursor-pointer transition-colors"
          >
            Đã xem
          </button>
          <button
            type="button"
            onClick={() => viewDetails(current.id)}
            className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-black hover:bg-gray-100 cursor-pointer transition-colors"
          >
            Xem chi tiết ngay
          </button>
        </div>
      </div>
    </div>
  );
}
