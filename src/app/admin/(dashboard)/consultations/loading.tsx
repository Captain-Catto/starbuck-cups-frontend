export default function ConsultationsLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="h-8 w-36 bg-gray-800 rounded mb-6" />
      <div className="flex gap-3 mb-6">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-28 bg-gray-800 rounded" />
        ))}
      </div>
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="h-12 border-b border-gray-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-20 border-b border-gray-700 last:border-0" />
        ))}
      </div>
    </div>
  );
}
