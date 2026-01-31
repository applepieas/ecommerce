"use client";

import { useState, useMemo } from "react";
import { useCart } from "./cart/CartContext";
import ProductGallery from "./ProductGallery";
import ColorPicker from "./ColorPicker";
import SizePicker from "./SizePicker";
import { AccordionItem, StarRating } from "./Accordion";
import WishlistButton from "./wishlist/WishlistButton";

// ============================================
// Types (matching getProduct return type)
// ============================================

interface Variant {
  id: string;
  sku: string;
  price: string;
  salePrice: string | null;
  inStock: number;
  color: { id: string; slug: string; name: string; hexCode: string } | null;
  size: { id: string; slug: string; name: string } | null;
}

interface ProductImage {
  id: string;
  url: string;
  isPrimary: boolean;
  sortOrder: number;
  variantId: string | null;
}

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    description: string | null;
    category: { id: string; name: string; slug: string } | null;
    brand: { id: string; name: string; slug: string; logoUrl: string | null } | null;
    gender: { id: string; slug: string; label: string } | null;
    variants: Variant[];
    images: ProductImage[];
    userId?: string;
  };
}

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  // Get unique colors from variants
  const uniqueColors = useMemo(() => {
    const colorMap = new Map<string, { id: string; slug: string; name: string; hexCode: string }>();
    product.variants.forEach((v) => {
      if (v.color && !colorMap.has(v.color.id)) {
        colorMap.set(v.color.id, v.color);
      }
    });
    return Array.from(colorMap.values());
  }, [product.variants]);

  // Get variant to color mapping for gallery
  const variantColorMap = useMemo(() => {
    const map = new Map<string, string>();
    product.variants.forEach((v) => {
      if (v.color) {
        map.set(v.id, v.color.id);
      }
    });
    return map;
  }, [product.variants]);

  // State for selection
  const [selectedColorId, setSelectedColorId] = useState<string | null>(
    uniqueColors[0]?.id ?? null
  );

  // Get selected color object
  const selectedColor = useMemo(() => {
    return uniqueColors.find((c) => c.id === selectedColorId) ?? null;
  }, [uniqueColors, selectedColorId]);

  // Get available sizes for selected color
  const availableSizes = useMemo(() => {
    const sizeMap = new Map<string, { id: string; slug: string; name: string; inStock: boolean }>();

    product.variants
      .filter((v) => !selectedColorId || v.color?.id === selectedColorId)
      .forEach((v) => {
        if (v.size) {
          const existing = sizeMap.get(v.size.id);
          // If size already exists, combine stock status
          if (existing) {
            existing.inStock = existing.inStock || v.inStock > 0;
          } else {
            sizeMap.set(v.size.id, {
              ...v.size,
              inStock: v.inStock > 0,
            });
          }
        }
      });

    return Array.from(sizeMap.values());
  }, [product.variants, selectedColorId]);

  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  // Find exact variant based on color + size selection
  const selectedVariant = useMemo(() => {
    if (!selectedColorId || !selectedSizeId) return null;

    return product.variants.find(
      (v) => v.color?.id === selectedColorId && v.size?.id === selectedSizeId
    ) ?? null;
  }, [product.variants, selectedColorId, selectedSizeId]);

  // Get price to display (from selected variant or first variant with selected color)
  const displayPrice = useMemo(() => {
    if (selectedVariant) {
      return {
        price: parseFloat(selectedVariant.price),
        salePrice: selectedVariant.salePrice ? parseFloat(selectedVariant.salePrice) : null,
      };
    }

    // Find any variant with selected color
    const colorVariant = product.variants.find((v) => v.color?.id === selectedColorId);
    if (colorVariant) {
      return {
        price: parseFloat(colorVariant.price),
        salePrice: colorVariant.salePrice ? parseFloat(colorVariant.salePrice) : null,
      };
    }

    // Fall back to first variant
    const first = product.variants[0];
    if (first) {
      return {
        price: parseFloat(first.price),
        salePrice: first.salePrice ? parseFloat(first.salePrice) : null,
      };
    }

    return { price: 0, salePrice: null };
  }, [selectedVariant, product.variants, selectedColorId]);

  // Stock status
  const isInStock = selectedVariant ? selectedVariant.inStock > 0 : true;
  const canAddToCart = selectedSizeId && selectedColorId && isInStock;

  // Cart Context
  const { addItem, isDrawerOpen } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!canAddToCart || !selectedVariant || !selectedColor) return;

    setIsAdding(true);
    try {
      // Find image for this variant/color or fallback to first
      const image = product.images.find(
        (img) => img.variantId === selectedVariant.id
      ) ||
        product.images.find(
          (img) => variantColorMap.get(selectedVariant.id) === img.variantId
        ) ||
        product.images[0];

      await addItem(
        product.id,
        selectedVariant.id,
        1,
        {
          price: displayPrice.price,
          salePrice: displayPrice.salePrice,
          productName: product.name,
          variantName: `${selectedColor.name} / ${selectedVariant.size?.name || "Size"}`,
          imageUrl: image?.url || "/placeholder.jpg",
        }
      );
    } catch (error) {
      console.error("Failed to add to cart:", error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      {/* Left Column - Gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <ProductGallery
          images={product.images}
          productName={product.name}
          selectedColorId={selectedColorId}
          variantColorMap={variantColorMap}
        />
      </div>

      {/* Right Column - Details */}
      <div className="flex flex-col gap-6">
        {/* Product Title & Category */}
        <div>
          <h1 className="text-heading-2 font-heading-2 leading-heading-2 text-dark-900">
            {product.name}
          </h1>
          <p className="mt-1 text-lead font-lead text-dark-700">
            {product.gender?.label} {product.category?.name}
          </p>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-3">
          {displayPrice.salePrice ? (
            <>
              <span className="text-heading-3 font-heading-3 text-red">
                ${displayPrice.salePrice.toFixed(2)}
              </span>
              <span className="text-body font-body text-dark-500 line-through">
                ${displayPrice.price.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-heading-3 font-heading-3 text-dark-900">
              ${displayPrice.price.toFixed(2)}
            </span>
          )}
        </div>

        {/* Color Picker */}
        {uniqueColors.length > 0 && (
          <ColorPicker
            colors={uniqueColors}
            selectedColorId={selectedColorId}
            onColorSelect={setSelectedColorId}
          />
        )}

        {/* Size Picker */}
        {availableSizes.length > 0 && (
          <SizePicker
            sizes={availableSizes}
            selectedSizeId={selectedSizeId}
            onSizeSelect={setSelectedSizeId}
          />
        )}

        {/* Stock Status */}
        {selectedVariant && !isInStock && (
          <p className="text-body font-body text-red">Out of Stock</p>
        )}

        {/* Add to Bag Button */}
        <button
          onClick={handleAddToCart}
          disabled={!canAddToCart || isAdding}
          className={`
            mt-2 flex h-14 w-full items-center justify-center rounded-full text-body font-body-medium transition-all
            ${canAddToCart && !isAdding
              ? "bg-dark-900 text-light-100 hover:bg-dark-700 active:scale-[0.98]"
              : "cursor-not-allowed bg-light-300 text-dark-500"
            }
          `}
        >
          {isAdding
            ? "Adding..."
            : !selectedSizeId
              ? "Select a Size"
              : !isInStock
                ? "Out of Stock"
                : "Add to Bag"}
        </button>

        {/* Favorite Button */}
        <WishlistButton
          productId={product.id}
          variantId={selectedVariant?.id}
          userId={product.userId}
          showLabel
          className="h-14 w-full rounded-full border border-light-400 bg-transparent py-0 text-body font-body-medium hover:border-dark-900 hover:bg-transparent"
        />

        {/* Accordion Sections */}
        <div className="mt-4">
          {/* Product Details */}
          <AccordionItem title="Product Details" defaultOpen={true}>
            <div className="flex flex-col gap-4">
              {product.description && (
                <p className="text-body font-body leading-relaxed text-dark-700">
                  {product.description}
                </p>
              )}
              <ul className="flex flex-col gap-2 text-body font-body text-dark-700">
                {selectedColor && (
                  <li className="flex items-start gap-2">
                    <span className="text-dark-500">•</span>
                    <span>Shown: {selectedColor.name}</span>
                  </li>
                )}
                {selectedVariant && (
                  <li className="flex items-start gap-2">
                    <span className="text-dark-500">•</span>
                    <span>Style: {selectedVariant.sku}</span>
                  </li>
                )}
              </ul>
            </div>
          </AccordionItem>

          {/* Shipping & Returns */}
          <AccordionItem title="Shipping & Returns">
            <div className="flex flex-col gap-4 text-body font-body text-dark-700">
              <div>
                <p className="font-body-medium text-dark-900">Free Delivery and Returns</p>
                <p className="mt-1">
                  Free standard delivery on orders over $50. Free returns within 60 days.
                </p>
              </div>
              <div>
                <p className="font-body-medium text-dark-900">Delivery Options</p>
                <ul className="mt-1 flex flex-col gap-1">
                  <li>• Standard Delivery: 3-5 business days</li>
                  <li>• Express Delivery: 1-2 business days</li>
                  <li>• Store Pickup: Available at select locations</li>
                </ul>
              </div>
            </div>
          </AccordionItem>

          {/* Reviews */}
          <AccordionItem
            title="Reviews (10)"
            rightElement={<StarRating rating={5} />}
          >
            <div className="flex flex-col gap-4">
              <p className="text-body font-body text-dark-700">
                This product has an average rating of 5 out of 5 stars based on 10 reviews.
              </p>
              <button className="text-body font-body-medium text-dark-900 underline hover:text-dark-700 self-start">
                Write a Review
              </button>
            </div>
          </AccordionItem>
        </div>
      </div>
    </div>
  );
}

