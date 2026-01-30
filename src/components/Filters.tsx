"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  parseQueryFilters,
  stringifyFilters,
  getActiveFilterCount,
  PRICE_RANGES,
  type FilterKey,
  type ProductFilters,
} from "@/lib/utils/query";

// ============================================
// Types
// ============================================

interface FilterGroup {
  key: FilterKey;
  label: string;
  options: { value: string; label: string; hexCode?: string }[];
}

interface FiltersProps {
  genders: { slug: string; label: string }[];
  sizes: { slug: string; name: string }[];
  colors: { slug: string; name: string; hexCode: string }[];
  /** Render mode: 'sidebar' for desktop, 'mobile' for mobile button + drawer */
  mode?: "sidebar" | "mobile";
}

// ============================================
// Filter Groups Configuration
// ============================================

function buildFilterGroups(props: FiltersProps): FilterGroup[] {
  return [
    {
      key: "gender",
      label: "Gender",
      options: props.genders.map((g) => ({ value: g.slug, label: g.label })),
    },
    {
      key: "size",
      label: "Size",
      options: props.sizes.map((s) => ({ value: s.slug, label: s.name })),
    },
    {
      key: "color",
      label: "Color",
      options: props.colors.map((c) => ({
        value: c.slug,
        label: c.name,
        hexCode: c.hexCode,
      })),
    },
    {
      key: "priceRange",
      label: "Shop By Price",
      options: PRICE_RANGES.map((p) => ({ value: p.value, label: p.label })),
    },
  ];
}

// ============================================
// Custom Checkbox Component
// ============================================

interface CheckboxProps {
  checked: boolean;
  onChange: () => void;
  label: string;
  hexCode?: string;
}

function Checkbox({ checked, onChange, label, hexCode }: CheckboxProps) {
  return (
    <div
      className="flex cursor-pointer items-center gap-3 text-body font-body text-dark-900 hover:text-dark-700"
      onClick={onChange}
    >
      <div
        role="checkbox"
        aria-checked={checked}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === " " || e.key === "Enter") {
            e.preventDefault();
            onChange();
          }
        }}
        className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${checked
          ? "border-dark-900 bg-dark-900"
          : "border-dark-500 bg-light-100 hover:border-dark-700"
          }`}
      >
        {checked && (
          <svg
            className="h-3 w-3 text-light-100"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
      {/* Color swatch for color options */}
      {hexCode && (
        <span
          className="h-5 w-5 rounded-full border border-light-400"
          style={{ backgroundColor: hexCode }}
          aria-hidden="true"
        />
      )}
      <span>{label}</span>
    </div>
  );
}

// ============================================
// Collapsible Filter Section
// ============================================

interface FilterSectionProps {
  label: string;
  filterKey: FilterKey;
  options: { value: string; label: string; hexCode?: string }[];
  selectedValues: string[];
  onToggle: (key: FilterKey, value: string) => void;
  defaultExpanded?: boolean;
}

function FilterSection({
  label,
  filterKey,
  options,
  selectedValues,
  onToggle,
  defaultExpanded = true,
}: FilterSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className="border-b border-light-300 py-4">
      {/* Section Header */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 focus-visible:ring-offset-2"
        aria-expanded={isExpanded}
      >
        <span className="text-body-medium font-body-medium text-dark-900">
          {label}
        </span>
        <svg
          className={`h-4 w-4 text-dark-700 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
            }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Options */}
      <div
        className={`mt-4 space-y-3 overflow-hidden transition-all duration-200 ${isExpanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {options.map((option) => (
          <Checkbox
            key={option.value}
            checked={selectedValues.includes(option.value)}
            onChange={() => onToggle(filterKey, option.value)}
            label={option.label}
            hexCode={option.hexCode}
          />
        ))}
      </div>
    </div>
  );
}

// ============================================
// Mobile Drawer
// ============================================

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  activeCount: number;
  onClearAll: () => void;
}

function MobileDrawer({
  isOpen,
  onClose,
  children,
  activeCount,
  onClearAll,
}: MobileDrawerProps) {
  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 z-40 bg-dark-900/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-80 max-w-full transform bg-light-100 shadow-xl transition-transform duration-300 ${isOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-light-300 px-6 py-4">
          <h2 className="text-heading-3 font-heading-3 text-dark-900">
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-dark-700 hover:text-dark-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900"
            aria-label="Close filters"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Filter Content */}
        <div className="h-[calc(100vh-140px)] overflow-y-auto px-6">
          {children}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-light-300 bg-light-100 px-6 py-4">
          <button
            type="button"
            onClick={onClearAll}
            disabled={activeCount === 0}
            className="text-body font-body text-dark-700 underline hover:text-dark-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear All
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-dark-900 px-6 py-2 text-body-medium font-body-medium text-light-100 transition-colors hover:bg-dark-700"
          >
            View Results
          </button>
        </div>
      </div>
    </>
  );
}

// ============================================
// Main Filters Component
// ============================================

export default function Filters({
  genders,
  sizes,
  colors,
  mode = "sidebar",
}: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Parse URL state
  const urlSearch = searchParams.toString();
  const urlFilters = useMemo(() => parseQueryFilters(urlSearch), [urlSearch]);

  // Local optimistic state - initialized from URL
  const [localFilters, setLocalFilters] = useState<ProductFilters>(() =>
    parseQueryFilters(urlSearch)
  );

  // Track last URL we pushed to avoid infinite loop
  const lastPushedUrl = useRef<string>(urlSearch);

  // Sync local state FROM URL when URL changes externally (e.g., browser back/forward, or initial load)
  useEffect(() => {
    // Only sync if URL changed externally (not from our own push)
    if (urlSearch !== lastPushedUrl.current) {
      setLocalFilters(urlFilters);
      lastPushedUrl.current = urlSearch;
    }
  }, [urlSearch, urlFilters]);

  // Sync URL FROM local filters when they change (debounced)
  useEffect(() => {
    const newSearch = stringifyFilters(localFilters);

    // Skip if this is the same as the current URL
    if (newSearch === urlSearch) return;

    // Skip if we just pushed this URL
    if (newSearch === lastPushedUrl.current) return;

    // Debounce URL updates to allow rapid clicking
    const timer = setTimeout(() => {
      lastPushedUrl.current = newSearch;
      router.push(newSearch ? `${pathname}?${newSearch}` : pathname, {
        scroll: false,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [localFilters, pathname, router, urlSearch]);

  const activeCount = getActiveFilterCount(localFilters);

  // Build filter groups from props
  const filterGroups = useMemo(
    () => buildFilterGroups({ genders, sizes, colors }),
    [genders, sizes, colors]
  );

  // Handle filter toggle - only update local state
  const handleToggle = useCallback((key: FilterKey, value: string) => {
    setLocalFilters((prev) => {
      const currentValues = prev[key];
      const isSelected = currentValues.includes(value);

      // Toggle: remove if present, add if not
      const newValues = isSelected
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];

      return {
        ...prev,
        [key]: newValues,
        page: 1, // Reset page on filter change
      };
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setLocalFilters((prev) => ({
      search: undefined,
      gender: [],
      size: [],
      color: [],
      brand: [],
      category: [],
      priceRange: [],
      sort: prev.sort,
      page: 1,
      limit: prev.limit,
    }));
    setIsDrawerOpen(false);
  }, []);

  // Render filter sections
  const filterContent = (
    <>
      {filterGroups.map((group, index) => (
        <FilterSection
          key={group.key}
          label={group.label}
          filterKey={group.key}
          options={group.options}
          selectedValues={localFilters[group.key]}
          onToggle={handleToggle}
          defaultExpanded={index < 2} // First two expanded by default
        />
      ))}
    </>
  );

  // Mobile mode: render button + drawer
  if (mode === "mobile") {
    return (
      <>
        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={() => setIsDrawerOpen(true)}
          className="flex items-center gap-2 rounded-full border border-light-400 px-4 py-2 text-body font-body text-dark-900 transition-colors hover:border-dark-900"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
            />
          </svg>
          <span>Filters{activeCount > 0 && ` (${activeCount})`}</span>
        </button>

        {/* Mobile Drawer */}
        <MobileDrawer
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          activeCount={activeCount}
          onClearAll={handleClearAll}
        >
          {filterContent}
        </MobileDrawer>
      </>
    );
  }

  // Desktop sidebar mode
  return (
    <aside className="w-64 flex-shrink-0">
      <div className="sticky top-24">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-body-medium font-body-medium text-dark-900">
            Filter By
          </h2>
          {activeCount > 0 && (
            <button
              type="button"
              onClick={handleClearAll}
              className="text-caption font-caption text-dark-700 underline hover:text-dark-900"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Filter Sections */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
          {filterContent}
        </div>
      </div>
    </aside>
  );
}
