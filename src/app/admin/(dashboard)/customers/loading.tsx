export default function CustomersLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-800 rounded mb-6" />
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-48 bg-gray-800 rounded" />
        <div className="h-10 w-32 bg-gray-800 rounded" />
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="h-12 border-b border-gray-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-700 last:border-0" />
        ))}
      </div>
    </div>
  );
}
