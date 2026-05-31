export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto px-4 pt-20 pb-12 md:px-6 lg:px-8 md:pt-24">
        <div className="h-8 w-32 bg-zinc-800 rounded animate-pulse mb-2" />
        <div className="h-4 w-80 bg-zinc-800 rounded animate-pulse mb-10" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-zinc-900 rounded-xl overflow-hidden">
              <div className="aspect-video bg-zinc-800 animate-pulse" />
              <div className="p-5 space-y-2">
                <div className="h-3 w-20 bg-zinc-800 rounded animate-pulse" />
                <div className="h-5 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 bg-zinc-800 rounded animate-pulse w-4/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
