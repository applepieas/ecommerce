"use client";

interface SizeOption {
  id: string;
  slug: string;
  name: string;
  inStock: boolean;
}

interface SizePickerProps {
  sizes: SizeOption[];
  selectedSizeId: string | null;
  onSizeSelect: (sizeId: string) => void;
}

export default function SizePicker({
  sizes,
  selectedSizeId,
  onSizeSelect,
}: SizePickerProps) {
  if (sizes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-body font-body-medium text-dark-900">
          Select Size
        </span>
        {/* Size guide link placeholder */}
        <button className="text-caption font-caption text-dark-700 underline hover:text-dark-900">
          Size Guide
        </button>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
        {sizes.map((size) => {
          const isSelected = size.id === selectedSizeId;
          const isDisabled = !size.inStock;

          return (
            <button
              key={size.id}
              onClick={() => !isDisabled && onSizeSelect(size.id)}
              disabled={isDisabled}
              className={`
                relative flex h-12 items-center justify-center rounded-md border text-body font-body transition-all
                ${isSelected
                  ? "border-dark-900 bg-dark-900 text-light-100"
                  : isDisabled
                    ? "cursor-not-allowed border-light-300 bg-light-100 text-dark-500 line-through"
                    : "border-light-400 bg-light-100 text-dark-900 hover:border-dark-900"
                }
              `}
              aria-label={`Size ${size.name}${isDisabled ? " - Out of stock" : ""}`}
            >
              {size.name}
              {/* Diagonal line for out of stock */}
              {isDisabled && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="h-px w-full rotate-[-20deg] bg-dark-500" />
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
