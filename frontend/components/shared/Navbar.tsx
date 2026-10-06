"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun, Menu, X, ChevronDown, Phone, Calculator,
  Home, Info, Zap, Package, FolderOpen, BookOpen, Mail
} from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  {
    label: "Solar Solutions",
    href: "/solutions",
    icon: Zap,
    children: [
      { label: "Residential Solar", href: "/solutions/residential-solar" },
      { label: "Commercial Solar", href: "/solutions/commercial-solar" },
      { label: "Industrial Solar", href: "/solutions/industrial-solar" },
      { label: "On-Grid Systems", href: "/solutions/on-grid" },
      { label: "Off-Grid Systems", href: "/solutions/off-grid" },
      { label: "Hybrid Systems", href: "/solutions/hybrid" },
      { label: "UPS Services", href: "/solutions/ups" },
    ],
  },
  { label: "Products", href: "/products", icon: Package },
  { label: "Projects", href: "/projects", icon: FolderOpen },
  { label: "Calculator", href: "/calculator", icon: Calculator },
  { label: "Blog", href: "/blog", icon: BookOpen },
  { label: "Contact", href: "/contact", icon: Mail },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", mobileOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [mobileOpen]);

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          isScrolled
            ? "bg-navy-900/98 backdrop-blur-md shadow-lg border-b border-white/10"
            : "bg-transparent"
        )}
        role="banner"
      >
        <nav
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
          aria-label="Main navigation"
        >
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-2.5 group" aria-label="Al Rehman Solar — Home">
              <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shadow-glow-green group-hover:scale-105 transition-transform">
                <Sun className="w-5 h-5 text-white" />
              </div>
              <div className="leading-none">
                <span className="block text-white font-bold text-base font-heading">
                  Al Rehman Solar
                </span>
                <span className="block text-green-400 text-[10px] font-medium tracking-wide uppercase">
                  System & UPS
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <ul className="hidden lg:flex items-center gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.label} className="relative">
                  {link.children ? (
                    <div
                      onMouseEnter={() => setOpenDropdown(link.label)}
                      onMouseLeave={() => setOpenDropdown(null)}
                    >
                      <button
                        className={cn(
                          "flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                          isActive(link.href)
                            ? "text-green-400 bg-green-400/10"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        )}
                        aria-expanded={openDropdown === link.label}
                        aria-haspopup="true"
                      >
                        {link.label}
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            openDropdown === link.label ? "rotate-180" : ""
                          )}
                        />
                      </button>

                      <AnimatePresence>
                        {openDropdown === link.label && (
                          <motion.div
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                            transition={{ duration: 0.15 }}
                            className="absolute top-full left-0 pt-2 min-w-[220px]"
                            role="menu"
                          >
                            <div className="bg-navy-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden py-2">
                              {link.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  role="menuitem"
                                  className={cn(
                                    "flex items-center px-4 py-2.5 text-sm transition-colors duration-150",
                                    isActive(child.href)
                                      ? "text-green-400 bg-green-400/10"
                                      : "text-gray-300 hover:text-white hover:bg-white/10"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ) : (
                    <Link
                      href={link.href}
                      className={cn(
                        "px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-150",
                        isActive(link.href)
                          ? "text-green-400 bg-green-400/10"
                          : "text-gray-300 hover:text-white hover:bg-white/10"
                      )}
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>

            {/* ── Desktop CTA ── */}
            <div className="hidden lg:flex items-center gap-3">
              <a
                href="tel:+923006639477"
                className="flex items-center gap-2 text-gray-300 hover:text-white text-sm font-medium transition-colors"
                aria-label="Call us"
              >
                <Phone className="w-4 h-4 text-green-400" />
                <span>Call Us</span>
              </a>
              <Link href="/quote" className="btn-primary text-sm py-2.5 px-5">
                Get Free Quote
              </Link>
            </div>

            {/* ── Mobile Menu Button ── */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-80 max-w-full bg-navy-900 shadow-2xl lg:hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                    <Sun className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white font-bold font-heading">Al Rehman Solar</span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Links */}
              <nav className="flex-1 overflow-y-auto p-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.label}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    {link.children ? (
                      <div>
                        <button
                          onClick={() =>
                            setOpenDropdown(openDropdown === link.label ? null : link.label)
                          }
                          className={cn(
                            "w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                            isActive(link.href)
                              ? "text-green-400 bg-green-400/10"
                              : "text-gray-300 hover:text-white hover:bg-white/10"
                          )}
                        >
                          <span className="flex items-center gap-3">
                            <link.icon className="w-4 h-4" />
                            {link.label}
                          </span>
                          <ChevronDown
                            className={cn(
                              "w-4 h-4 transition-transform",
                              openDropdown === link.label ? "rotate-180" : ""
                            )}
                          />
                        </button>
                        <AnimatePresence>
                          {openDropdown === link.label && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden ml-4 mt-1 space-y-1 border-l-2 border-green-600/30 pl-4"
                            >
                              {link.children.map((child) => (
                                <Link
                                  key={child.href}
                                  href={child.href}
                                  className={cn(
                                    "block px-3 py-2.5 rounded-lg text-sm transition-colors",
                                    isActive(child.href)
                                      ? "text-green-400"
                                      : "text-gray-400 hover:text-white"
                                  )}
                                >
                                  {child.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors",
                          isActive(link.href)
                            ? "text-green-400 bg-green-400/10"
                            : "text-gray-300 hover:text-white hover:bg-white/10"
                        )}
                      >
                        <link.icon className="w-4 h-4" />
                        {link.label}
                      </Link>
                    )}
                  </motion.div>
                ))}
              </nav>

              {/* CTA */}
              <div className="p-4 border-t border-white/10 space-y-3">
                <Link href="/quote" className="btn-primary w-full justify-center">
                  Get Free Quote
                </Link>
                <a
                  href="tel:+923006639477"
                  className="flex items-center justify-center gap-2 text-gray-300 hover:text-white text-sm py-2"
                >
                  <Phone className="w-4 h-4 text-green-400" />
                  Call Us Now
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
