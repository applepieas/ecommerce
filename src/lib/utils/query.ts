import queryString from "query-string";

// ============================================
// Types
// ============================================

export interface ProductFilters {
  gender: string[];
  size: string[];
  color: string[];
  priceRange: string[];
  sort: string;
  page: number;
}

export type FilterKey = keyof Omit<ProductFilters, "sort" | "page">;

export const DEFAULT_FILTERS: ProductFilters = {
  gender: [],
  size: [],
  color: [],
  priceRange: [],
  sort: "featured",
  page: 1,
};

export const SORT_OPTIONS = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
] as const;

export const PRICE_RANGES = [
  { value: "0-100", label: "$0 - $100", min: 0, max: 100 },
  { value: "100-150", label: "$100 - $150", min: 100, max: 150 },
  { value: "150-200", label: "$150 - $200", min: 150, max: 200 },
  { value: "200+", label: "$200+", min: 200, max: Infinity },
] as const;

// ============================================
// Parsing Functions
// ============================================

/**
 * Parse URL search string into ProductFilters object
 */
export function parseQueryFilters(search: string): ProductFilters {
  const parsed = queryString.parse(search, { arrayFormat: "comma" });

  const toArray = (value: string | (string | null)[] | null): string[] => {
    if (!value) return [];
    let arr: string[];
    if (Array.isArray(value)) {
      arr = value.filter((v): v is string => v !== null);
    } else if (typeof value === "string" && value.includes(",")) {
      // Handle comma-separated values that might come from encoded URLs
      arr = value.split(",");
    } else {
      arr = [value];
    }
    // Deduplicate values
    return [...new Set(arr)];
  };

  return {
    gender: toArray(parsed.gender),
    size: toArray(parsed.size),
    color: toArray(parsed.color),
    priceRange: toArray(parsed.priceRange),
    sort: typeof parsed.sort === "string" ? parsed.sort : "featured",
    page: typeof parsed.page === "string" ? parseInt(parsed.page, 10) || 1 : 1,
  };
}

/**
 * Convert ProductFilters object to URL search string
 */
export function stringifyFilters(filters: Partial<ProductFilters>): string {
  const params: Record<string, string | string[]> = {};

  // Only include non-empty arrays
  if (filters.gender?.length) params.gender = filters.gender;
  if (filters.size?.length) params.size = filters.size;
  if (filters.color?.length) params.color = filters.color;
  if (filters.priceRange?.length) params.priceRange = filters.priceRange;

  // Only include sort if not default
  if (filters.sort && filters.sort !== "featured") {
    params.sort = filters.sort;
  }

  // Only include page if not 1
  if (filters.page && filters.page > 1) {
    params.page = String(filters.page);
  }

  return queryString.stringify(params, { arrayFormat: "comma" });
}

// ============================================
// Update Functions
// ============================================

/**
 * Add or update a single value for a filter key (replaces existing)
 */
export function setQueryParam(
  currentSearch: string,
  key: string,
  value: string
): string {
  const parsed = queryString.parse(currentSearch, { arrayFormat: "comma" });
  parsed[key] = value;
  return queryString.stringify(parsed, { arrayFormat: "comma" });
}

/**
 * Toggle a value in an array-based filter (add if missing, remove if present)
 */
export function toggleQueryParam(
  currentSearch: string,
  key: FilterKey,
  value: string
): string {
  const filters = parseQueryFilters(currentSearch);
  const currentValues = filters[key];

  if (currentValues.includes(value)) {
    // Remove value
    filters[key] = currentValues.filter((v) => v !== value);
  } else {
    // Add value
    filters[key] = [...currentValues, value];
  }

  // Reset page when filter changes
  filters.page = 1;

  return stringifyFilters(filters);
}

/**
 * Remove a specific value from an array-based filter
 */
export function removeQueryParam(
  currentSearch: string,
  key: FilterKey,
  value: string
): string {
  const filters = parseQueryFilters(currentSearch);
  filters[key] = filters[key].filter((v) => v !== value);
  filters.page = 1;
  return stringifyFilters(filters);
}

/**
 * Clear all values for a specific filter key
 */
export function clearFilterKey(currentSearch: string, key: FilterKey): string {
  const filters = parseQueryFilters(currentSearch);
  filters[key] = [];
  filters.page = 1;
  return stringifyFilters(filters);
}

/**
 * Clear all filters and reset to defaults
 */
export function clearAllFilters(): string {
  return "";
}

/**
 * Update sort and reset page to 1
 */
export function updateSort(currentSearch: string, sort: string): string {
  const filters = parseQueryFilters(currentSearch);
  filters.sort = sort;
  filters.page = 1;
  return stringifyFilters(filters);
}

/**
 * Get active filter count (for mobile badge)
 */
export function getActiveFilterCount(filters: ProductFilters): number {
  return (
    filters.gender.length +
    filters.size.length +
    filters.color.length +
    filters.priceRange.length
  );
}

/**
 * Build URL path with query string
 */
export function buildProductsUrl(filters: Partial<ProductFilters>): string {
  const search = stringifyFilters(filters);
  return search ? `/products?${search}` : "/products";
}
