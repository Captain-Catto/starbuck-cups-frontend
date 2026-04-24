export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 pt-20 pb-4 md:px-6 lg:px-8 md:pt-24 md:pb-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar skeleton */}
          <div className="lg:w-72 shrink-0 space-y-4">
            <div className="h-10 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-48 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-32 bg-zinc-800 rounded-lg animate-pulse" />
            <div className="h-32 bg-zinc-800 rounded-lg animate-pulse" />
          </div>

          {/* Products grid skeleton */}
          <div className="flex-1 space-y-6">
            {/* Breadcrumb skeleton */}
            <div className="h-5 w-48 bg-zinc-800 rounded animate-pulse" />

            {/* Toolbar skeleton */}
            <div className="h-10 bg-zinc-800 rounded-lg animate-pulse" />

            {/* Grid skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-square bg-zinc-800 rounded-xl animate-pulse" />
                  <div className="h-4 bg-zinc-800 rounded animate-pulse" />
                  <div className="h-3 w-2/3 bg-zinc-800 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
