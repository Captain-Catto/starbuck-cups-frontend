export default function HeroImagesLoading() {
  return (
    <div className="min-h-screen bg-black p-6 animate-pulse">
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-40 bg-gray-800 rounded" />
        <div className="h-10 w-32 bg-gray-800 rounded" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg h-48 border border-gray-700" />
        ))}
      </div>
    </div>
  );
}
