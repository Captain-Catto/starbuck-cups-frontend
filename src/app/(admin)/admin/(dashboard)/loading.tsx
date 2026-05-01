export default function AdminDashboardLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="h-8 w-48 bg-gray-800 rounded mb-6" />

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-28 border border-gray-700" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 h-64 border border-gray-700" />
        <div className="bg-gray-800 rounded-lg p-4 h-64 border border-gray-700" />
      </div>
    </div>
  );
}
