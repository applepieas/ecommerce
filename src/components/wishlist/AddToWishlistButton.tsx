"use client";

import WishlistButton from "./WishlistButton";

interface AddToWishlistButtonProps {
  productId: string;
  variantId?: string;
  userId?: string;
  initialIsLiked?: boolean;
  className?: string;
}

export default function AddToWishlistButton({
  productId,
  variantId,
  userId,
  initialIsLiked,
  className,
}: AddToWishlistButtonProps) {
  return (
    <WishlistButton
      productId={productId}
      variantId={variantId}
      userId={userId}
      showLabel={false}
      initialIsLiked={initialIsLiked}
      className={className}
    />
  );
}
