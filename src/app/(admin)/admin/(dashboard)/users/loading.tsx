export default function UsersLoading() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
      <div className="mb-6 flex items-center justify-between">
        <div className="h-8 w-56 rounded bg-gray-800" />
        <div className="h-10 w-40 rounded bg-gray-800" />
      </div>
      <div className="mb-6 flex gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 w-40 rounded bg-gray-800" />
        ))}
      </div>
      <div className="rounded-lg border border-gray-700 bg-gray-800">
        <div className="h-12 border-b border-gray-700" />
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-16 border-b border-gray-700 last:border-0" />
        ))}
      </div>
    </div>
  );
}
