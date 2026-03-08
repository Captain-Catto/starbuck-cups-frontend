export default function StatisticsLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-36 bg-gray-800 rounded mb-6" />

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-32 border border-gray-700" />
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg p-4 h-80 border border-gray-700" />
        <div className="bg-gray-800 rounded-lg p-4 h-80 border border-gray-700" />
      </div>
    </div>
  );
}
