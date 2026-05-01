export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-800 rounded mb-6" />
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg p-4 h-20 border border-gray-700" />
        ))}
      </div>
    </div>
  );
}
