import Image from "next/image";
import Link from "next/link";
import { ProductCardData } from "@/lib/actions/product";

interface HomeTrendingProps {
  products?: ProductCardData[]; // Optional, in case we want to make it dynamic later
}

// Static fallback data based on HTML content and local assets
const defaultItems = [
  {
    id: "trend-1",
    title: "React Presto",
    description: "With React foam for the most comfortable Presto ever.",
    imageSrc: "/trending-1.png",
    cta: "Shop Now",
    link: "/products?collection=react-presto",
    isLarge: true
  },
  {
    id: "trend-2",
    title: "Summer Must-Haves: Air Max Dia",
    imageSrc: "/trending-2.png",
    link: "/products?collection=air-max",
    isLarge: false
  },
  {
    id: "trend-3",
    title: "Air Jordan 11 Retro Low LE",
    imageSrc: "/trending-3.png",
    link: "/products?collection=jordan",
    isLarge: false
  }
];

export default function HomeTrending({ products }: HomeTrendingProps) {
  return (
    <section className="w-full px-14 py-16 lg:pt-24 lg:pb-16 text-dark-900">
      <h2 className="text-2xl font-semibold text-dark-900 tracking-tight mb-8">
        Trending Now
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Large Featured Card (React Presto) */}
        <div className="group relative md:col-span-2 h-[400px] lg:h-[500px] w-full rounded-sm overflow-hidden">
          <Image
            src={defaultItems[0].imageSrc}
            alt={defaultItems[0].title}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/20 to-transparent"></div>
          <div className="relative h-full flex flex-col justify-center items-start px-8 lg:px-16 max-w-xl">
            <h3 className="text-4xl lg:text-5xl font-semibold text-light-100 tracking-tight mb-3 uppercase">
              {defaultItems[0].title}
            </h3>
            <p className="text-light-200 text-lg mb-8 font-normal leading-relaxed">
              {defaultItems[0].description}
            </p>
            <Link
              href={defaultItems[0].link}
              className="bg-light-100 hover:bg-light-200 text-dark-900 text-sm font-medium py-3 px-8 rounded-full transition-colors duration-200"
            >
              Shop Now
            </Link>
          </div>
        </div>

        {/* Smaller Card 1 */}
        <Link
          href={defaultItems[1].link}
          className="group relative h-[350px] w-full rounded-sm overflow-hidden block"
        >
          <Image
            src={defaultItems[1].imageSrc}
            alt={defaultItems[1].title}
            fill
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <h3 className="text-xl lg:text-2xl font-medium text-light-100 tracking-tight">
              {defaultItems[1].title}
            </h3>
          </div>
        </Link>

        {/* Smaller Card 2 */}
        <Link
          href={defaultItems[2].link}
          className="group relative h-[350px] w-full rounded-sm overflow-hidden block"
        >
          <Image
            src={defaultItems[2].imageSrc}
            alt={defaultItems[2].title}
            fill
            className="absolute inset-0 w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity"></div>
          <div className="absolute bottom-0 left-0 p-8">
            <h3 className="text-xl lg:text-2xl font-medium text-light-100 tracking-tight">
              {defaultItems[2].title}
            </h3>
          </div>
        </Link>
      </div>
    </section>
  );
}
