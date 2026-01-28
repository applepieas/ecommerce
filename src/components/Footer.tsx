import Image from "next/image";

interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

const footerColumns: FooterColumn[] = [
  {
    title: "Featured",
    links: [
      { label: "Air Force 1", href: "#" },
      { label: "Huarache", href: "#" },
      { label: "Air Max 90", href: "#" },
      { label: "Air Max 95", href: "#" },
    ],
  },
  {
    title: "Shoes",
    links: [
      { label: "All Shoes", href: "#" },
      { label: "Custom Shoes", href: "#" },
      { label: "Jordan Shoes", href: "#" },
      { label: "Running Shoes", href: "#" },
    ],
  },
  {
    title: "Clothing",
    links: [
      { label: "All Clothing", href: "#" },
      { label: "Modest Wear", href: "#" },
      { label: "Hoodies & Pullovers", href: "#" },
      { label: "Shirts & Tops", href: "#" },
    ],
  },
  {
    title: "Kids'",
    links: [
      { label: "Infant & Toddler Shoes", href: "#" },
      { label: "Kids' Shoes", href: "#" },
      { label: "Kids' Jordan Shoes", href: "#" },
      { label: "Kids' Basketball Shoes", href: "#" },
    ],
  },
];

const socialLinks = [
  { name: "X", icon: "/x.svg", href: "#" },
  { name: "Facebook", icon: "/facebook.svg", href: "#" },
  { name: "Instagram", icon: "/instagram.svg", href: "#" },
];

const legalLinks = [
  { label: "Guides", href: "#" },
  { label: "Terms of Sale", href: "#" },
  { label: "Terms of Use", href: "#" },
  { label: "Nike Privacy Policy", href: "#" },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-900">
      {/* Main Footer Content */}
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-6 lg:gap-12">
          {/* Logo */}
          <div className="col-span-2 md:col-span-1">
            <a href="/" aria-label="Nike Home">
              <Image
                src="/logo.svg"
                alt="Nike"
                width={60}
                height={22}
                className="h-6 w-auto brightness-0 invert"
              />
            </a>
          </div>

          {/* Navigation Columns */}
          {footerColumns.map((column) => (
            <div key={column.title} className="col-span-1">
              <h3 className="mb-4 text-caption font-caption text-light-100">
                {column.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-caption font-footnote text-dark-500 transition-colors hover:text-light-100"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Social Icons */}
          <div className="col-span-2 flex items-start justify-start gap-4 md:col-span-1 md:justify-end">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-dark-700 transition-colors hover:bg-dark-500"
                aria-label={social.name}
              >
                <Image
                  src={social.icon}
                  alt={social.name}
                  width={16}
                  height={16}
                  className="h-4 w-4 brightness-0 invert"
                />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-700">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          {/* Location and Copyright */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-center md:justify-start">
            <span className="flex items-center gap-1 text-footnote font-footnote text-dark-500">
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Croatia
            </span>
            <span className="text-footnote font-footnote text-dark-500">
              © {currentYear} Nike, Inc. All Rights Reserved
            </span>
          </div>

          {/* Legal Links */}
          <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
            {legalLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-footnote font-footnote text-dark-500 transition-colors hover:text-light-100"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}
