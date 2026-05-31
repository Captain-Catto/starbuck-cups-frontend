import type { Category } from "@/types";
import {
  createAdminListSlice,
  type AdminListPagination,
  type AdminListState,
  type StatusFilter,
} from "./createAdminListSlice";

export interface CategoryWithCount extends Category {
  _count?: { products: number };
}

export type CategoryPagination = AdminListPagination;
export type CategoryStatusFilter = StatusFilter;
export type CategoriesState = AdminListState<CategoryWithCount>;

const categoriesFactory = createAdminListSlice<CategoryWithCount>({
  name: "categories",
  apiBase: "categories",
});

export const fetchCategoriesThunk = categoriesFactory.fetchThunk;
export const toggleCategoryStatusThunk = categoriesFactory.toggleStatusThunk;
export const deleteCategoryThunk = categoriesFactory.deleteThunk;

export const {
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setItemsDirectly: setCategoriesDirectly,
} = categoriesFactory.actions;

export default categoriesFactory.reducer;
