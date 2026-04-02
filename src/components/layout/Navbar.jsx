"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { Search, User, ShoppingCart, Menu, X, Store } from "lucide-react";

const navLinks = [
  { href: "/#home", label: "Home" },
  { href: "/#products", label: "Products" },
  { href: "/#offers", label: "Special Offers" },
  { href: "/#features", label: "Why Choose Us" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { items } = useCartStore();

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isActive = (href) => {
    if (href.startsWith("/#")) {
      const sectionId = href.substring(2);
      const section = document.getElementById(sectionId);
      if (section) {
        const rect = section.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom >= 100;
      }
    }
    return false;
  };

  const handleNavClick = (e, href) => {
    if (href.startsWith("/#")) {
      e.preventDefault();
      const sectionId = href.substring(2);
      const section = document.getElementById(sectionId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="bg-secondary text-white text-center py-2 text-sm">
        <div className="container">
          সমীকরণ শপে আপনাকে স্বাগতম। আমাদের যে কোন পণ্য অর্ডার করতে WhatsApp
          করুন: +880 1996-570203 | হট লাইন: 01996-570203
        </div>
      </div>

      {/* Main Navigation */}
      <header
        className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50"
        style={{ top: "32px" }}
      >
        <div className="container">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1">
              <Store className="text-primary text-2xl" />
              <span className="text-xl font-bold text-primary">সমীকরণ</span>
              <span className="text-xl font-bold text-secondary">শপ</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex gap-6">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={`text-secondary font-semibold hover:text-primary transition-all duration-300 relative py-2 ${isActive(link.href) ? "text-primary" : ""}`}
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Navigation Icons */}
            <div className="flex items-center gap-5 text-xl">
              <button className="text-secondary hover:text-primary transition-all duration-300 hover:-translate-y-1">
                <Search className="h-5 w-5" />
              </button>
              <Link
                href="/profile"
                className="text-secondary hover:text-primary transition-all duration-300 hover:-translate-y-1 hidden sm:block"
              >
                <User className="h-5 w-5" />
              </Link>
              <Link
                href="/cart"
                className="relative text-secondary hover:text-primary transition-all duration-300 hover:-translate-y-1"
              >
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount > 99 ? "99+" : itemCount}
                  </span>
                )}
              </Link>

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden text-secondary"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <nav className="fixed top-0 left-0 w-80 h-full bg-white shadow-xl z-50 lg:hidden pt-20 px-7">
            <ul className="flex flex-col gap-5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-secondary font-semibold hover:text-primary transition-all duration-300 ${isActive(link.href) ? "text-primary" : ""}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/profile"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-secondary font-semibold hover:text-primary transition-all duration-300"
                >
                  My Account
                </Link>
              </li>
            </ul>
          </nav>
        </>
      )}

      <div className="h-20"></div>
    </>
  );
}
