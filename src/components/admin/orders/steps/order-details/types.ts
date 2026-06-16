import { Product } from "@/types/orders";

/**
 * Product search state + handlers from useProductSearch, passed down
 * through the order-details component tree.
 */
export interface ProductSearchControls {
  productSearchTerm: string;
  searchingProducts: boolean;
  productSearchResults: Product[];
  showProductDropdown: boolean;
  activeItemIndex: number | null;
  onSearch: (term: string, itemIndex: number) => void;
  onClearSearch: () => void;
  onSelectProduct: (product: Product, itemIndex: number) => void;
  setActiveItemIndex: (index: number | null) => void;
  setProductSearchTerm: (term: string) => void;
  setShowProductDropdown: (show: boolean) => void;
}

export type UpdateItemHandler = (
  index: number,
  field: string,
  value: string | number | Product
) => void;
