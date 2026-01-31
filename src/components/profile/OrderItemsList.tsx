"use client";

import { useState } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { X } from "lucide-react";

interface OrderItemsListProps {
  items: any[];
}

export default function OrderItemsList({ items }: OrderItemsListProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-6">
        <h2 className="text-lg font-medium text-gray-900 border-b pb-2">Items</h2>
        {items.map((item: any) => {
          const img =
            item.productVariant?.product?.images?.find(
              (i: any) => i.isPrimary
            ) || item.productVariant?.product?.images?.[0];

          return (
            <div key={item.id} className="flex gap-4">
              <div
                className="relative h-24 w-24 flex-shrink-0 cursor-zoom-in overflow-hidden rounded-md border border-gray-200 bg-gray-100 group"
                onClick={() => img && setSelectedImage(img.url)}
              >
                {img ? (
                  <>
                    <Image
                      src={img.url}
                      alt={item.productVariant?.product?.name || "Product"}
                      fill
                      className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/5" />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-xs text-gray-400">
                    No Img
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">
                  {item.productVariant?.product?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {item.productVariant?.color?.name} /{" "}
                  {item.productVariant?.size?.value}
                </p>
                <div className="mt-1 flex items-center justify-between">
                  <p className="text-sm text-gray-900">Qty {item.quantity}</p>
                  <p className="font-medium text-gray-900">
                    {formatPrice(item.priceAtPurchase)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Image Modal / Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </button>

          <div
            className="relative h-full max-h-[85vh] w-full max-w-4xl overflow-hidden rounded-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image container
          >
            <Image
              src={selectedImage}
              alt="Enlarged product"
              fill
              className="object-contain"
              quality={100}
            />
          </div>
        </div>
      )}
    </>
  );
}
