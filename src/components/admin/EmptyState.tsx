import { Plus } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  className = "",
}: EmptyStateProps) {
  const defaultIcon = (
    <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center bg-gray-700 rounded-lg">
      <svg
        className="w-6 h-6 text-white"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  );

  return (
    <div
      className={`bg-gray-800 rounded-lg border border-gray-700 p-8 ${className}`}
    >
      <div className="text-center">
        {icon || defaultIcon}
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors mx-auto"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
