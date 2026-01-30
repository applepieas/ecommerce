"use client";

import Image from "next/image";
import { useState, useMemo } from "react";

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  variantId: string | null;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  selectedColorId?: string | null;
  variantColorMap?: Map<string, string>; // variantId -> colorId
}

export default function ProductGallery({
  images,
  productName,
  selectedColorId,
  variantColorMap,
}: ProductGalleryProps) {
  // Filter images based on selected color
  const filteredImages = useMemo(() => {
    if (!selectedColorId || !variantColorMap) {
      // Show generic images (no variantId) or all if no color selected
      const genericImages = images.filter((img) => !img.variantId);
      return genericImages.length > 0 ? genericImages : images;
    }

    // Get variant IDs that match the selected color
    const matchingVariantIds = new Set<string>();
    variantColorMap.forEach((colorId, variantId) => {
      if (colorId === selectedColorId) {
        matchingVariantIds.add(variantId);
      }
    });

    // Filter images for matching variants or generic images
    const colorImages = images.filter(
      (img) => img.variantId && matchingVariantIds.has(img.variantId)
    );

    // Fall back to generic images if no color-specific images
    if (colorImages.length === 0) {
      const genericImages = images.filter((img) => !img.variantId);
      return genericImages.length > 0 ? genericImages : images;
    }

    return colorImages;
  }, [images, selectedColorId, variantColorMap]);

  // Sort images by primary flag and sort order
  const sortedImages = useMemo(() => {
    return [...filteredImages].sort((a, b) => {
      if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1;
      return a.sortOrder - b.sortOrder;
    });
  }, [filteredImages]);

  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset selection when images change
  const currentImage = sortedImages[selectedIndex] || sortedImages[0];

  if (sortedImages.length === 0) {
    return (
      <div className="aspect-square w-full rounded-lg bg-light-200 flex items-center justify-center">
        <span className="text-dark-500">No image available</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-visible rounded-lg bg-light-200">
        <Image
          src={currentImage.url}
          alt={productName}
          fill
          className="object-cover transition-opacity duration-300"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnail Strip */}
      {sortedImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto overflow-visible pb-2 p-1">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={`relative aspect-square w-16 flex-shrink-0 overflow-visible rounded-md transition-all outline-none ${index === selectedIndex
                ? "ring-2 ring-dark-900"
                : "ring-1 ring-light-300 hover:ring-dark-500"
                }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={image.url}
                alt={`${productName} thumbnail ${index + 1}`}
                fill
                className="object-cover rounded-md"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
