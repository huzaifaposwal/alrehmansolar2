import type { Metadata } from "next";
import Link from "next/link";
import { Battery, CheckCircle2, ArrowRight, Zap, Wrench, HeadphonesIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "UPS Services in Lahore — UPS Installation & Battery Replacement",
  description:
    "Professional UPS installation, battery replacement, and maintenance services in Lahore, Pakistan. All major brands supported by Al Rehman Solar.",
};

const services = [
  {
    icon: Battery,
    title: "UPS Installation",
    desc: "Supply and installation of UPS systems for homes, offices, and businesses. We carry all major brands.",
  },
  {
    icon: Wrench,
    title: "Battery Replacement",
    desc: "Expert battery replacement for existing UPS systems. We supply quality batteries with warranties.",
  },
  {
    icon: HeadphonesIcon,
    title: "UPS Maintenance",
    desc: "Routine maintenance, servicing, and troubleshooting for UPS systems to ensure reliable backup power.",
  },
  {
    icon: Zap,
    title: "UPS Repair",
    desc: "Diagnosis and repair of faulty UPS systems, inverters, and battery chargers for all brands.",
  },
];

export default function UpsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="UPS services hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                <Battery className="w-4 h-4" /> UPS Services
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                UPS Installation &amp; <span className="gradient-text">Maintenance in Lahore</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Professional UPS installation, battery replacement, and maintenance services for homes and businesses in Lahore. All major brands supported.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-base px-8 py-4">
                  Get Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline-white text-base px-8 py-4">
                  Contact Us
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-64 h-64 bg-green-600/10 rounded-full flex items-center justify-center border border-green-500/20">
                <div className="w-40 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-glow-green">
                  <Battery className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-white" aria-labelledby="ups-services-heading">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="section-tag"><Battery className="w-4 h-4" /> Our UPS Services</span>
            <h2 id="ups-services-heading" className="section-heading">UPS Services We Provide</h2>
            <p className="section-subheading">
              From new installations to battery replacements and repairs — we handle all aspects of UPS and power backup systems.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {services.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 group">
                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Combine with Solar */}
      <section className="section bg-gray-50" aria-labelledby="combine-heading">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-12">
            <span className="section-tag"><Zap className="w-4 h-4" /> Solar + UPS</span>
            <h2 id="combine-heading" className="section-heading">Consider a Solar + Battery System</h2>
          </div>
          <div className="card p-8">
            <p className="text-gray-700 leading-relaxed mb-6">
              While a standalone UPS provides power backup, combining it with a solar system means your batteries are charged for free using solar energy instead of expensive grid electricity. This significantly reduces your electricity bills while providing the backup power you need.
            </p>
            <ul className="space-y-2 mb-6">
              {[
                "Batteries charged by free solar energy — no running costs",
                "Works during both load shedding and long power outages",
                "Combines the benefits of solar savings with UPS backup",
                "Single, integrated system with one point of support",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
            <Link href="/solutions/hybrid" className="btn-primary text-sm py-2.5 px-5 inline-flex">
              Learn About Hybrid Solar Systems <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-950 relative overflow-hidden" aria-label="CTA">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-main text-center relative z-10">
          <h2 className="section-heading-white mb-4">Need a UPS or Battery Replacement?</h2>
          <p className="section-subheading-white mb-8">
            Contact us for a free consultation and we&apos;ll recommend the right solution for your power backup needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-base px-8 py-4">
              Get Free Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="btn-outline-white text-base px-8 py-4">
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
