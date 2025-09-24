// Image utility functions

export interface ProductImage {
  url: string;
  order: number;
}

/**
 * Get the first image by order (lowest order number)
 * @param productImages Array of product images with order
 * @returns First image object or null if no images
 */
export const getFirstProductImage = (productImages?: ProductImage[]): ProductImage | null => {
  if (!productImages || productImages.length === 0) return null;
  return productImages.reduce((first, current) =>
    current.order < first.order ? current : first
  );
};

/**
 * Get the first image URL by order
 * @param productImages Array of product images with order
 * @returns First image URL or empty string if no images
 */
export const getFirstProductImageUrl = (productImages?: ProductImage[]): string => {
  const firstImage = getFirstProductImage(productImages);
  return firstImage?.url || '';
};

/**
 * Get the second image by order (for hover effects)
 * @param productImages Array of product images with order
 * @returns Second image object or null if less than 2 images
 */
export const getSecondProductImage = (productImages?: ProductImage[]): ProductImage | null => {
  if (!productImages || productImages.length < 2) return null;
  const sortedImages = productImages.sort((a, b) => a.order - b.order);
  return sortedImages[1];
};