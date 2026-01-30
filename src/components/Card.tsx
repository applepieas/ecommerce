import Image from "next/image";

interface CardProps {
  title: string;
  category: string;
  price: number;
  imageUrl: string;
  colorCount?: number;
  badge?: string;
}

export default function Card({
  title,
  category,
  price,
  imageUrl,
  colorCount,
  badge,
}: CardProps) {
  return (
    <article className="group flex flex-col h-full overflow-hidden rounded-lg bg-light-100 border border-light-300">
      {/* Image Container */}
      <div className="relative aspect-square overflow-hidden bg-light-200">
        {/* Badge */}
        {badge && (
          <span className="absolute left-4 top-4 z-10 rounded-full border border-red bg-light-100 px-3 py-1 text-caption font-caption text-red">
            {badge}
          </span>
        )}

        {/* Product Image */}
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Product Info */}
          <div className="flex flex-col gap-1">
            <h3 className="text-body font-body font-bold text-dark-900 line-clamp-2">
              {title}
            </h3>
            <p className="text-body font-body text-dark-700">{category}</p>
            {colorCount && colorCount > 0 && (
              <p className="text-body font-body text-dark-700">
                {colorCount} Colour{colorCount > 1 ? "s" : ""}
              </p>
            )}
          </div>

          {/* Price */}
          <span className="flex-shrink-0 text-body font-body-medium text-dark-900">
            ${price.toFixed(2)}
          </span>
        </div>
      </div>
    </article>
  );
}
