import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function HomeHero() {
  return (
    <section className="relative w-full min-h-[800px] flex items-center justify-center overflow-hidden py-24 lg:py-0">
      {/* Background Layer with Faded Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/hero-bg.png" // Using uploaded image
          alt="Runners Background"
          fill
          className="object-cover opacity-[1] select-none pointer-events-none"
          priority
        />

      </div>

      <div className="relative z-10 w-full px-14">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-8 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start max-w-2xl">
            <span className="text-pink-500 font-medium text-base mb-5 tracking-wide uppercase">
              Bold & Sporty
            </span>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold text-dark-900 tracking-tight leading-[1.1] mb-8">
              Style That Moves <br className="hidden lg:block" /> With You.
            </h1>

            <p className="text-xl sm:text-2xl text-dark-500 leading-relaxed mb-10 max-w-lg">
              Not just style. Not just comfort. Footwear that effortlessly moves
              with your every step.
            </p>

            <Link
              href="/products"
              className="group bg-dark-900 hover:bg-dark-800 text-light-100 text-lg font-medium py-4 px-10 rounded-full transition-all duration-300 shadow-xl shadow-dark-900/10 flex items-center gap-2"
            >
              Find Your Shoe
            </Link>
          </div>

          {/* Right Content */}
          <div className="relative w-full h-[500px] lg:h-[700px] flex items-center justify-center select-none">
            {/* Background shapes from HTML */}



            <div className="relative z-20 w-full max-w-[600px] transform lg:translate-x-10 lg:-translate-y-10">
              <Image
                src="/hero-shoe.png" // Using uploaded image
                alt="Colorful Sneaker"
                width={1000}
                height={800}
                className="w-full h-auto drop-shadow-2xl object-contain transform -rotate-[15deg] hover:scale-105 transition-transform duration-500 ease-out"
                priority
              />
              <div className="absolute -bottom-10 left-10 right-10 h-8 bg-black/20 blur-xl rounded-[100%] transform rotate-[-15deg]"></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
