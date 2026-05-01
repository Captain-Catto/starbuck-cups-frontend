export default function CapacitiesLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-36 bg-gray-800 rounded" />
        <div className="h-10 w-32 bg-gray-800 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-24 border border-gray-700" />
        ))}
      </div>
    </div>
  );
}
