"use client";

import { useState, useTransition, useEffect } from "react";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { addToWishlist, removeFromWishlist, isInWishlist } from "@/lib/actions/wishlist";
import { cn } from "@/lib/utils";

interface WishlistButtonProps {
  productId: string;
  variantId?: string;
  userId?: string;
  showLabel?: boolean;
  initialIsLiked?: boolean;
  className?: string;
}

export default function WishlistButton({
  productId,
  variantId,
  userId,
  showLabel = false,
  initialIsLiked = false,
  className,
}: WishlistButtonProps) {
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [isChecking, setIsChecking] = useState(!initialIsLiked);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    // If we were initialized as liked, we don't need to check
    if (initialIsLiked) {
      setIsChecking(false);
      return;
    }

    if (userId) {
      isInWishlist({ productId, variantId, userId }).then((inWishlist) => {
        setIsLiked(inWishlist);
        setIsChecking(false);
      });
    } else {
      setIsChecking(false);
    }
  }, [productId, variantId, userId, initialIsLiked]);

  const toggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      router.push("/login"); // Or show toast
      return;
    }

    // Optimistic update
    const previousState = isLiked;
    setIsLiked(!isLiked);

    startTransition(async () => {
      try {
        if (!previousState) {
          const result = await addToWishlist({ productId, variantId });
          if (result.error) {
            setIsLiked(previousState); // Revert
            // Show error toast
          }
        } else {
          const result = await removeFromWishlist({ productId, variantId });
          if (result.error) {
            setIsLiked(previousState); // Revert
          }
        }
        router.refresh();
      } catch (error) {
        setIsLiked(previousState);
      }
    });
  };

  if (isChecking) {
    return <div className={cn("h-10 w-10 animate-pulse bg-gray-200 rounded-full", className)} />;
  }

  return (
    <button
      onClick={toggleWishlist}
      disabled={isPending}
      className={cn(
        "group flex items-center justify-center gap-2 transition-colors",
        showLabel
          ? "w-full rounded-full border border-gray-300 py-3 text-body font-body-medium hover:border-dark-900"
          : "h-9 w-9 rounded-full bg-white p-2 shadow-sm hover:bg-gray-50",
        isLiked ? "text-red-500" : "text-dark-900",
        className
      )}
      aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
    >
      <Heart
        className={cn(
          "h-5 w-5 transition-transform group-active:scale-95",
          isLiked && "fill-current"
        )}
      />
      {showLabel && (
        <span className="text-dark-900">
          {isLiked ? "In Wishlist" : "Favorite"}
        </span>
      )}
    </button>
  );
}
