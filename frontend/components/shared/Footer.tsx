"use client";

import Link from "next/link";
import { Sun, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Linkedin, MessageCircle } from "lucide-react";
import { getWhatsAppLink } from "@/lib/utils";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923006639477";

const footerLinks = {
  solutions: [
    { label: "Residential Solar", href: "/solutions/residential-solar" },
    { label: "Commercial Solar", href: "/solutions/commercial-solar" },
    { label: "Industrial Solar", href: "/solutions/industrial-solar" },
    { label: "Hybrid Solar System", href: "/solutions/hybrid" },
    { label: "On-Grid Solar", href: "/solutions/on-grid" },
    { label: "Off-Grid Solar", href: "/solutions/off-grid" },
    { label: "UPS Services", href: "/solutions/ups" },
  ],
  products: [
    { label: "Solar Panels", href: "/products?category=solar-panels" },
    { label: "Solar Inverters", href: "/products?category=solar-inverters" },
    { label: "Batteries", href: "/products?category=batteries" },
    { label: "UPS Systems", href: "/products?category=ups-systems" },
    { label: "Accessories", href: "/products?category=solar-accessories" },
  ],
  company: [
    { label: "About Us", href: "/about" },
    { label: "Our Projects", href: "/projects" },
    { label: "Blog", href: "/blog" },
    { label: "Solar Calculator", href: "/calculator" },
    { label: "Get Free Quote", href: "/quote" },
    { label: "Contact Us", href: "/contact" },
  ],
};

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-navy-950 text-white" role="contentinfo">
      {/* ── Main Footer ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4" aria-label="Al Rehman Solar Home">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-glow-green">
                <Sun className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="block text-white font-bold text-lg font-heading">Al Rehman Solar</span>
                <span className="block text-green-400 text-xs font-medium tracking-wider uppercase">System & UPS</span>
              </div>
            </Link>

            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-xs">
              Professional solar panel installation, hybrid systems, and UPS solutions in Lahore, Pakistan.
              Helping homes and businesses achieve energy independence.
            </p>

            {/* Contact Info */}
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-sm text-gray-400">
                <MapPin className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                <span>Eden Abad, A Block, near Khayaban-e-Amin, Edenabad, Lahore, Pakistan</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Phone className="w-4 h-4 text-green-400 flex-shrink-0" />
                <a href="tel:+923006639477" className="hover:text-white transition-colors">
                  +92 300 6639477
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-400">
                <Mail className="w-4 h-4 text-green-400 flex-shrink-0" />
                <a href="mailto:alrehmansolarspk@gmail.com" className="hover:text-white transition-colors">
                  alrehmansolarspk@gmail.com
                </a>
              </li>
            </ul>

            {/* Social */}
            <div className="flex items-center gap-3">
              {[
                { Icon: Facebook, label: "Facebook", href: "#" },
                { Icon: Instagram, label: "Instagram", href: "#" },
                { Icon: Youtube, label: "YouTube", href: "#" },
                { Icon: Linkedin, label: "LinkedIn", href: "#" },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 hover:bg-green-600 text-gray-400 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-heading">Solutions</h3>
            <ul className="space-y-2.5" role="list">
              {footerLinks.solutions.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Products */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-heading">Products</h3>
            <ul className="space-y-2.5" role="list">
              {footerLinks.products.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4 font-heading">Company</h3>
            <ul className="space-y-2.5" role="list">
              {footerLinks.company.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-gray-400 hover:text-green-400 transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom Bar ── */}
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm text-center sm:text-left">
            © {currentYear} Al Rehman Solar System & UPS. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="/sitemap.xml" className="hover:text-gray-300 transition-colors">Sitemap</Link>
            <span>·</span>
            <span>Lahore, Pakistan</span>
          </div>
        </div>
      </div>

      {/* ── WhatsApp Floating Button ── */}
      <a
        href={getWhatsAppLink(WHATSAPP)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bd5a] rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-200"
      >
        <MessageCircle className="w-7 h-7 text-white" />
      </a>
    </footer>
  );
}
