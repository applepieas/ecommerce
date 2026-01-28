import Image from "next/image";

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Dark Hero (hidden on mobile) */}
      <div className="hidden w-1/2 flex-col justify-between bg-dark-900 p-8 lg:flex lg:p-12">
        {/* Logo */}
        <div>
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-light-100">
            <Image
              src="/logo.svg"
              alt="Nike"
              width={32}
              height={12}
              className="h-auto w-6"
            />
          </div>
        </div>

        {/* Tagline Section */}
        <div className="max-w-md">
          <h1 className="mb-4 text-heading-2 font-heading-2 leading-heading-2 text-light-100">
            Just Do It
          </h1>
          <p className="mb-8 text-lead font-lead leading-lead text-dark-500">
            Join millions of athletes and fitness enthusiasts who trust Nike for
            their performance needs.
          </p>

          {/* Pagination Dots */}
          <div className="flex gap-2">
            <span className="h-2 w-2 rounded-full bg-light-100" />
            <span className="h-2 w-2 rounded-full bg-dark-700" />
            <span className="h-2 w-2 rounded-full bg-dark-700" />
          </div>
        </div>

        {/* Copyright */}
        <p className="text-footnote font-footnote text-dark-500">
          © {new Date().getFullYear()} Nike. All rights reserved.
        </p>
      </div>

      {/* Right Panel - Form Content */}
      <div className="flex w-full flex-col justify-center bg-light-100 px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
