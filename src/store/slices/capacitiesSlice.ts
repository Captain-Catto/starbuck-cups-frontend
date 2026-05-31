import type { Capacity } from "@/types";
import {
  createAdminListSlice,
  type AdminListPagination,
  type AdminListState,
  type StatusFilter,
} from "./createAdminListSlice";

export interface CapacityWithCount extends Capacity {
  _count?: { products: number };
}

export type CapacityPagination = AdminListPagination;
export type CapacityStatusFilter = StatusFilter;
export type CapacitiesState = AdminListState<CapacityWithCount>;

const capacitiesFactory = createAdminListSlice<CapacityWithCount>({
  name: "capacities",
  apiBase: "capacities",
});

export const fetchCapacitiesThunk = capacitiesFactory.fetchThunk;
export const toggleCapacityStatusThunk = capacitiesFactory.toggleStatusThunk;
export const deleteCapacityThunk = capacitiesFactory.deleteThunk;

export const {
  setSearchQuery,
  setStatusFilter,
  setCurrentPage,
  setItemsDirectly: setCapacitiesDirectly,
} = capacitiesFactory.actions;

export default capacitiesFactory.reducer;
