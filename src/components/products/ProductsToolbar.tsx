import { Filter } from "lucide-react";

interface ProductsToolbarProps {
  hasActiveFilters: boolean;
  onToggleFilters: () => void;
}

export function ProductsToolbar({
  hasActiveFilters,
  onToggleFilters,
}: ProductsToolbarProps) {
  return (
    <div className="lg:hidden bg-zinc-900 border border-zinc-800 rounded-lg p-4 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          {/* Mobile Filter Toggle */}
          <button
            onClick={onToggleFilters}
            className="flex items-center gap-2 px-3 py-2 border border-zinc-700 rounded-lg hover:bg-zinc-800 relative text-white"
          >
            <Filter className="w-4 h-4" />
            Bộ lọc
            {hasActiveFilters && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}