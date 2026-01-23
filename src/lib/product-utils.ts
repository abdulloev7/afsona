// Utility functions for product variant handling

export interface SizeVariant {
  volume: string;
  price: number;
}

export interface ProductWithVariants {
  sizes?: string[] | null;
  size_variants?: SizeVariant[] | null;
}

export interface ProductWithPrice extends ProductWithVariants {
  price: number;
}

/**
 * Check if a product has multiple variants that require selection
 */
export const hasMultipleVariants = (product: ProductWithVariants): boolean => {
  return (
    (product.size_variants && product.size_variants.length > 0) ||
    (product.sizes && product.sizes.length > 1)
  );
};

/**
 * Get the price for a specific variant, or fall back to base price
 */
export const getVariantPrice = (
  product: ProductWithPrice,
  selectedSize: string | null
): number => {
  if (product.size_variants && selectedSize) {
    const variant = product.size_variants.find(v => v.volume === selectedSize);
    if (variant) return variant.price;
  }
  return product.price;
};
