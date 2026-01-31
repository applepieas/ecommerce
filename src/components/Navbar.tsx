"use client";

import Link from "next/link";
import { useState } from "react";
import CartIconButton from "./cart/CartIconButton";
import ProfileDropdown from "./layout/ProfileDropdown";
import Image from "next/image";

interface NavbarProps {
  cartCount?: number;
  user: {
    id: string;
    email: string;
    name: string;
    image?: string | null;
  } | null;
}

export default function Navbar({ cartCount = 0, user }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { label: "Men", href: "/products?gender=men" },
    { label: "Women", href: "/products?gender=women" },
    { label: "Kids", href: "/products" },
    { label: "Collections", href: "/products" },
    { label: "Contact", href: "#" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-light-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0" aria-label="Nike Home">
          <Image
            src="/logo.svg"
            alt="Nike"
            width={60}
            height={22}
            className="h-5 w-auto md:h-6"
            priority
          />
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-body font-body text-dark-900 transition-colors hover:text-dark-700"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-6 md:flex">
          {/* Search Button */}
          <button
            type="button"
            className="text-body font-body text-dark-900 transition-colors hover:text-dark-700"
            aria-label="Search"
          >
            Search
          </button>

          {/* User Profile or Login */}
          {user ? (
            <ProfileDropdown user={user} />
          ) : (
            <Link
              href="/login"
              className="text-body font-body text-dark-900 transition-colors hover:text-dark-700"
            >
              Login
            </Link>
          )}

          {/* Cart */}
          <CartIconButton />
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          {/* Mobile Cart */}
          <CartIconButton />

          {/* Hamburger Button */}
          <button
            type="button"
            className="relative h-6 w-6 text-dark-900"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
          >
            <span
              className={`absolute left-0 top-1 block h-0.5 w-6 bg-dark-900 transition-transform duration-300 ${isMenuOpen ? "translate-y-1.5 rotate-45" : ""
                }`}
            />
            <span
              className={`absolute left-0 top-3 block h-0.5 w-6 bg-dark-900 transition-opacity duration-300 ${isMenuOpen ? "opacity-0" : ""
                }`}
            />
            <span
              className={`absolute left-0 top-5 block h-0.5 w-6 bg-dark-900 transition-transform duration-300 ${isMenuOpen ? "-translate-y-1.5 -rotate-45" : ""
                }`}
            />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`overflow-hidden transition-all duration-300 md:hidden ${isMenuOpen ? "max-h-96" : "max-h-0"
          }`}
      >
        <ul className="border-t border-light-300 bg-light-100 px-6 py-4">
          {navLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="block py-3 text-body font-body text-dark-900 transition-colors hover:text-dark-700"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2 border-t border-light-300 pt-4">
            <button
              type="button"
              className="block w-full py-3 text-left text-body font-body text-dark-900 transition-colors hover:text-dark-700"
            >
              Search
            </button>
          </li>
          {user ? (
            <>
              <li className="mt-2 border-t border-light-300 pt-4">
                <Link
                  href="/profile"
                  className="block w-full py-3 text-left text-body font-body text-dark-900 transition-colors hover:text-dark-700"
                >
                  My Profile
                </Link>
              </li>
              <li className="mt-2">
                <Link
                  href="/profile?tab=favorites"
                  className="block w-full py-3 text-left text-body font-body text-dark-900 transition-colors hover:text-dark-700"
                >
                  Wishlist
                </Link>
              </li>
            </>
          ) : (
            <li className="mt-2 border-t border-light-300 pt-4">
              <Link
                href="/login"
                className="block w-full py-3 text-left text-body font-body text-dark-900 transition-colors hover:text-dark-700"
              >
                Login
              </Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
}
