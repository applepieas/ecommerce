"use client";

interface ColorOption {
  id: string;
  slug: string;
  name: string;
  hexCode: string;
}

interface ColorPickerProps {
  colors: ColorOption[];
  selectedColorId: string | null;
  onColorSelect: (colorId: string) => void;
}

export default function ColorPicker({
  colors,
  selectedColorId,
  onColorSelect,
}: ColorPickerProps) {
  if (colors.length === 0) {
    return null;
  }

  const selectedColor = colors.find((c) => c.id === selectedColorId);

  return (
    <div className="flex flex-col gap-3">
      <span className="text-body font-body-medium text-dark-900">
        {selectedColor ? selectedColor.name : "Select Color"}
      </span>

      <div className="flex flex-wrap gap-2">
        {colors.map((color) => {
          const isSelected = color.id === selectedColorId;

          return (
            <button
              key={color.id}
              onClick={() => onColorSelect(color.id)}
              className={`
                group relative h-8 w-8 rounded-full transition-all
                ${isSelected ? "ring-2 ring-dark-900 ring-offset-2" : "hover:ring-2 hover:ring-dark-500 hover:ring-offset-1"}
              `}
              style={{ backgroundColor: color.hexCode }}
              aria-label={`Select ${color.name} color`}
              title={color.name}
            >
              {/* Inner border for light colors */}
              <span className="absolute inset-0.5 rounded-full ring-1 ring-inset ring-dark-900/10" />

              {/* Checkmark for selected */}
              {isSelected && (
                <span className="absolute inset-0 flex items-center justify-center">
                  <svg
                    className={`h-4 w-4 ${isLightColor(color.hexCode) ? "text-dark-900" : "text-light-100"
                      }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Determine if a color is light based on its hex code
 */
function isLightColor(hexCode: string): boolean {
  const hex = hexCode.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Using luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
