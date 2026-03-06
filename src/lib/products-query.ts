import type { CapacityRange } from "@/types";

export interface ProductsQueryInput {
  searchQuery: string;
  selectedCategory: string;
  selectedColor: string;
  capacityRange: CapacityRange;
  sortBy: string;
  currentPage: number;
  limit: number;
}

function getSortParams(sortBy: string): { field: string; order: string } {
  if (sortBy === "featured") {
    return { field: "isFeatured", order: "desc" };
  }

  if (sortBy === "newest") {
    return { field: "createdAt", order: "desc" };
  }

  if (sortBy === "oldest") {
    return { field: "createdAt", order: "asc" };
  }

  const [field = "createdAt", order = "desc"] = sortBy.split("_");
  return { field, order };
}

export function buildProductsQueryParams({
  searchQuery,
  selectedCategory,
  selectedColor,
  capacityRange,
  sortBy,
  currentPage,
  limit,
}: ProductsQueryInput): URLSearchParams {
  const params = new URLSearchParams();

  if (searchQuery) params.append("search", searchQuery);
  if (selectedCategory) params.append("category", selectedCategory);
  if (selectedColor) params.append("color", selectedColor);
  if (capacityRange.min > 0) params.append("minCapacity", `${capacityRange.min}`);
  if (capacityRange.max < 9999) params.append("maxCapacity", `${capacityRange.max}`);

  const { field, order } = getSortParams(sortBy);
  params.append("sortBy", field);
  params.append("sortOrder", order);

  params.append("page", `${currentPage}`);
  params.append("limit", `${limit}`);

  return params;
}
