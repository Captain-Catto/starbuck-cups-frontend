interface LoadingStateProps {
  itemCount?: number;
  className?: string;
}

export function LoadingState({
  itemCount = 6,
  className = "",
}: LoadingStateProps) {
  return (
    <div className={`space-y-6 bg-black min-h-screen p-6 ${className}`}>
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(itemCount)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg"></div>
          ))}
        </div>
      </div>
    </div>
  );
}
