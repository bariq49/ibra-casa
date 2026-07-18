// In-memory cache for product image colors
// In production, you should use Redis or store in database
// In-memory cache for product image colors
// In production, you should use Redis or store in database
const colorCache = new Map<string, any[]>();

/**
 * Get product image colors with caching
 * @param {string} imageUrl - Product image URL
 * @returns {Promise<Array>} Dominant colors
 */
export async function getCachedProductColors(imageUrl: string, extractColorsFromUrl: (url: string) => Promise<any[]>): Promise<any[]> {
  if (colorCache.has(imageUrl)) {
    return colorCache.get(imageUrl)!;
  }

  const colors = await extractColorsFromUrl(imageUrl);

  // Cache for 1 hour
  colorCache.set(imageUrl, colors);

  // Clear cache after 1 hour
  setTimeout(
    () => {
      colorCache.delete(imageUrl);
    },
    60 * 60 * 1000
  );

  return colors;
}

/**
 * Clear the color cache (useful for testing or manual refresh)
 */
export function clearColorCache(): void {
  colorCache.clear();
}

export { colorCache };
