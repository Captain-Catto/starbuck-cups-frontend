interface ErrorMessageProps {
  error: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorMessage({
  error,
  onRetry,
  className = "",
}: ErrorMessageProps) {
  return (
    <div
      className={`bg-gray-800 border border-gray-700 rounded-lg p-4 ${className}`}
    >
      <div className="text-white mb-2">⚠️ {error}</div>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
      >
        Thử lại
      </button>
    </div>
  );
}
