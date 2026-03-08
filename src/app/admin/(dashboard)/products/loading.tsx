export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-gray-900 animate-pulse">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header skeleton */}
        <div className="flex justify-between items-center mb-6">
          <div className="h-8 w-56 bg-gray-800 rounded" />
          <div className="h-10 w-36 bg-gray-800 rounded" />
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-3 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 w-32 bg-gray-800 rounded" />
          ))}
        </div>

        {/* Table skeleton */}
        <div className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="h-12 border-b border-gray-700" />
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-16 border-b border-gray-700 last:border-0" />
          ))}
        </div>
      </div>
    </div>
  );
}
