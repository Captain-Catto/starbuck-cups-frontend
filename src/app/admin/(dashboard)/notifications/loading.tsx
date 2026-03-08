export default function NotificationsLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="h-8 w-40 bg-gray-800 rounded mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-20 border border-gray-700" />
        ))}
      </div>
    </div>
  );
}
