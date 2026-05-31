export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <div className="container mx-auto max-w-3xl px-4 pt-20 pb-12 md:pt-24">
        <div className="h-4 w-48 bg-zinc-800 rounded animate-pulse mb-8" />
        <div className="aspect-video bg-zinc-800 rounded-xl animate-pulse mb-8" />
        <div className="h-8 bg-zinc-800 rounded animate-pulse mb-4" />
        <div className="h-6 w-3/4 bg-zinc-800 rounded animate-pulse mb-8" />
        <div className="space-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={`h-4 bg-zinc-800 rounded animate-pulse ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}
