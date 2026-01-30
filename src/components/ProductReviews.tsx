"use client";

import { useState } from "react";
import { StarRating } from "./Accordion";
import { type ProductReview } from "@/lib/actions/product";

interface ProductReviewsProps {
  reviews: ProductReview[];
}

export default function ProductReviews({ reviews }: ProductReviewsProps) {
  return (
    <section className="mt-16 border-t border-light-300 pt-12" id="reviews">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-16">
        {/* Header Section */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <h2 className="text-heading-3 font-heading-3 text-dark-900">
            Reviews ({reviews.length})
          </h2>

          <div className="flex items-center gap-2">
            <div className="flex text-dark-900">
              <StarRating rating={4.6} maxRating={5} />
            </div>
            <span className="text-body font-body-medium text-dark-900">
              4.6 Stars
            </span>
          </div>

          <button className="flex items-center justify-center rounded-full border border-dark-900 px-6 py-3 text-body font-body-medium text-dark-900 transition-colors hover:bg-dark-900 hover:text-light-100 lg:w-full">
            Write a Review
          </button>
        </div>

        {/* Reviews List */}
        <div className="flex flex-col gap-8 lg:w-2/3">
          {reviews.map((review) => (
            <ReviewItem key={review.id} review={review} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ReviewItem({ review }: { review: ProductReview }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isLongReview = review.content.length > 150;

  // Format date properly
  const date = new Date(review.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <article className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <StarRating rating={review.rating} />
          {review.title && (
            <h3 className="font-body-medium text-dark-900">{review.title}</h3>
          )}
        </div>
        <span className="text-footnote font-caption text-dark-700">{date}</span>
      </div>

      {/* Content */}
      <div className="text-body font-body text-dark-700">
        <p>
          {isExpanded || !isLongReview
            ? review.content
            : `${review.content.slice(0, 150)}...`}
        </p>

        {isLongReview && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-footnote font-body-medium text-dark-900 underline decoration-1 underline-offset-4 hover:text-dark-700"
          >
            {isExpanded ? "Read Less" : "Read More"}
          </button>
        )}
      </div>

      {/* Author */}
      <p className="text-footnote font-caption text-dark-500">
        {review.author}
      </p>
    </article>
  );
}
