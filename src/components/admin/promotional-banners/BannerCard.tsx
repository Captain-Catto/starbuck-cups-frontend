"use client";

import { PromotionalBanner } from "@/hooks/admin/usePromotionalBanner";
import { Edit, Trash2, Eye, EyeOff, Calendar, Link as LinkIcon } from "lucide-react";

interface BannerCardProps {
  banner: PromotionalBanner;
  onEdit: (banner: PromotionalBanner) => void;
  onDelete: (banner: PromotionalBanner) => void;
  onToggleActive: (banner: PromotionalBanner) => void;
  formatDate: (date: string) => string;
}

export function BannerCard({
  banner,
  onEdit,
  onDelete,
  onToggleActive,
  formatDate,
}: BannerCardProps) {
  return (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-colors">
      {/* Header with Priority Badge */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
            Priority: {banner.priority}
          </span>
          {banner.isActive ? (
            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded flex items-center gap-1">
              <Eye className="w-3 h-3" />
              Active
            </span>
          ) : (
            <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Inactive
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleActive(banner)}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
            title={banner.isActive ? "Deactivate" : "Activate"}
          >
            {banner.isActive ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => onEdit(banner)}
            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(banner)}
            className="p-2 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Banner Content Preview */}
      <div className="p-4">
        <h3 className="text-xl font-bold text-white mb-2">
          {banner.title}
          {banner.highlightText && (
            <>
              <br />
              <span className="text-green-400">{banner.highlightText}</span>
            </>
          )}
        </h3>
        <p className="text-gray-300 text-sm mb-3 line-clamp-2">
          {banner.description}
        </p>

        {/* Button Preview */}
        <div className="mb-3">
          <div className="inline-flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full text-sm font-medium">
            {banner.buttonText}
            <LinkIcon className="w-3 h-3 cursor-pointer" />
          </div>
          <p className="text-xs text-gray-400 mt-1">→ {banner.buttonLink}</p>
        </div>

        {/* Metadata */}
        <div className="space-y-1 text-xs text-gray-400">
          {(banner.validFrom || banner.validUntil) && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {banner.validFrom && `Từ ${formatDate(banner.validFrom)}`}
                {banner.validFrom && banner.validUntil && " - "}
                {banner.validUntil && `Đến ${formatDate(banner.validUntil)}`}
              </span>
            </div>
          )}
          <div>
            Tạo bởi: {banner.createdByAdmin?.username || "Unknown"}
          </div>
          <div>Cập nhật: {formatDate(banner.updatedAt)}</div>
        </div>
      </div>
    </div>
  );
}
