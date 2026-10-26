export default function ProfileLoading() {
  return (
    <div className="min-h-screen bg-gray-900 p-6 animate-pulse">
      <div className="mb-6 h-8 w-48 rounded bg-gray-800" />
      <div className="mx-auto max-w-xl space-y-4">
        <div className="h-32 rounded-lg border border-gray-700 bg-gray-800" />
        <div className="h-64 rounded-lg border border-gray-700 bg-gray-800" />
      </div>
    </div>
  );
}
