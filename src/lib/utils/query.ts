import queryString from "query-string";

// ============================================
// Types
// ============================================

export interface ProductFilters {
  search?: string;
  gender: string[];
  size: string[];
  color: string[];
  brand: string[];
  category: string[];
  priceRange: string[];
  sort: string;
  page: number;
  limit: number;
}

export type FilterKey = keyof Omit<ProductFilters, "search" | "sort" | "page" | "limit">;

export const ITEMS_PER_PAGE = 24;

export const DEFAULT_FILTERS: ProductFilters = {
  search: undefined,
  gender: [],
  size: [],
  color: [],
  brand: [],
  category: [],
  priceRange: [],
  sort: "featured",
  page: 1,
  limit: ITEMS_PER_PAGE,
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
 * Parse Next.js searchParams object into ProductFilters
 * This is the recommended approach for Next.js 15+ server components
 */
export function parseFilterParams(
  searchParams: { [key: string]: string | string[] | undefined }
): ProductFilters {
  const toArray = (value: string | string[] | undefined): string[] => {
    if (!value) return [];
    if (Array.isArray(value)) {
      return [...new Set(value.filter((v): v is string => Boolean(v)))];
    }
    // Handle comma-separated values
    if (typeof value === "string" && value.includes(",")) {
      return [...new Set(value.split(",").filter(Boolean))];
    }
    return [value];
  };

  const search = typeof searchParams.search === "string" ? searchParams.search : undefined;
  const sort = typeof searchParams.sort === "string" ? searchParams.sort : "featured";
  const page = typeof searchParams.page === "string" ? parseInt(searchParams.page, 10) || 1 : 1;
  const limit = typeof searchParams.limit === "string" ? parseInt(searchParams.limit, 10) || ITEMS_PER_PAGE : ITEMS_PER_PAGE;

  return {
    search,
    gender: toArray(searchParams.gender),
    size: toArray(searchParams.size),
    color: toArray(searchParams.color),
    brand: toArray(searchParams.brand),
    category: toArray(searchParams.category),
    priceRange: toArray(searchParams.priceRange),
    sort,
    page,
    limit,
  };
}

/**
 * Parse URL search string into ProductFilters object
 * Legacy function - kept for backwards compatibility
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
    search: typeof parsed.search === "string" ? parsed.search : undefined,
    gender: toArray(parsed.gender),
    size: toArray(parsed.size),
    color: toArray(parsed.color),
    brand: toArray(parsed.brand),
    category: toArray(parsed.category),
    priceRange: toArray(parsed.priceRange),
    sort: typeof parsed.sort === "string" ? parsed.sort : "featured",
    page: typeof parsed.page === "string" ? parseInt(parsed.page, 10) || 1 : 1,
    limit: typeof parsed.limit === "string" ? parseInt(parsed.limit, 10) || ITEMS_PER_PAGE : ITEMS_PER_PAGE,
  };
}

/**
 * Convert ProductFilters object to URL search string
 */
export function stringifyFilters(filters: Partial<ProductFilters>): string {
  const params: Record<string, string | string[]> = {};

  // Only include search if present
  if (filters.search) params.search = filters.search;

  // Only include non-empty arrays
  if (filters.gender?.length) params.gender = filters.gender;
  if (filters.size?.length) params.size = filters.size;
  if (filters.color?.length) params.color = filters.color;
  if (filters.brand?.length) params.brand = filters.brand;
  if (filters.category?.length) params.category = filters.category;
  if (filters.priceRange?.length) params.priceRange = filters.priceRange;

  // Only include sort if not default
  if (filters.sort && filters.sort !== "featured") {
    params.sort = filters.sort;
  }

  // Only include page if not 1
  if (filters.page && filters.page > 1) {
    params.page = String(filters.page);
  }

  // Only include limit if not default
  if (filters.limit && filters.limit !== ITEMS_PER_PAGE) {
    params.limit = String(filters.limit);
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
    filters.brand.length +
    filters.category.length +
    filters.priceRange.length +
    (filters.search ? 1 : 0)
  );
}

/**
 * Build URL path with query string
 */
export function buildProductsUrl(filters: Partial<ProductFilters>): string {
  const search = stringifyFilters(filters);
  return search ? `/products?${search}` : "/products";
}
