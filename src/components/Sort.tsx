"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { parseQueryFilters, updateSort, SORT_OPTIONS } from "@/lib/utils/query";

// ============================================
// Sort Dropdown Component
// ============================================

export default function Sort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Parse current sort from URL
  const currentSearch = searchParams.toString();
  const filters = parseQueryFilters(currentSearch);
  const currentSort = filters.sort;

  // Get current sort label
  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === currentSort)?.label || "Sort By";

  // Handle sort change
  const handleSortChange = useCallback(
    (sortValue: string) => {
      const newSearch = updateSort(currentSearch, sortValue);
      router.push(newSearch ? `${pathname}?${newSearch}` : pathname, {
        scroll: false,
      });
      setIsOpen(false);
    },
    [currentSearch, pathname, router]
  );

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-body font-body text-dark-900 transition-colors hover:text-dark-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark-900 focus-visible:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span>Sort By</span>
        <span className="text-body-medium font-body-medium bg-light-200 px-2 py-1 border border-light-300 rounded text-dark-700">{currentLabel}</span>
        <svg
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
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

      {/* Dropdown Menu */}
      <div
        className={`absolute right-0 top-full z-30 mt-2 w-48 origin-top-right rounded-lg border border-light-300 bg-light-100 shadow-lg transition-all duration-200 ${isOpen
          ? "scale-100 opacity-100"
          : "pointer-events-none scale-95 opacity-0"
          }`}
        role="listbox"
        aria-label="Sort options"
      >
        <ul className="py-2">
          {SORT_OPTIONS.map((option) => (
            <li key={option.value}>
              <button
                type="button"
                onClick={() => handleSortChange(option.value)}
                className={`flex w-full items-center justify-between px-4 py-2 text-left text-body font-body transition-colors hover:bg-light-200 focus:outline-none focus-visible:bg-light-200 ${currentSort === option.value
                  ? "text-dark-900"
                  : "text-dark-700"
                  }`}
                role="option"
                aria-selected={currentSort === option.value}
              >
                <span>{option.label}</span>
                {currentSort === option.value && (
                  <svg
                    className="h-4 w-4 text-dark-900"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
