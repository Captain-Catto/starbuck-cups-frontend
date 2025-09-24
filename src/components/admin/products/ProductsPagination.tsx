import { Pagination } from "@/components/ui/Pagination";
import type { PaginationMeta } from "@/types";

interface ProductsPaginationProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
}

export function ProductsPagination({
  pagination,
  onPageChange,
}: ProductsPaginationProps) {
  if (pagination.total_pages <= 1) return null;

  return (
    <div className="bg-gray-800 px-4 py-3 border-t border-gray-700">
      <Pagination
        data={pagination}
        onPageChange={onPageChange}
        className="justify-center"
      />
    </div>
  );
}