export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-40 bg-gray-800 rounded mb-6" />

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-24 border border-gray-700" />
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-36 bg-gray-800 rounded" />
        ))}
      </div>

      {/* Table */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="h-12 border-b border-gray-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-700 last:border-0" />
        ))}
      </div>
    </div>
  );
}
