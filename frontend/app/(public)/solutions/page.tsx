import type { Metadata } from "next";
import Link from "next/link";
import { Home, Building2, Factory, CloudSun, Battery, Zap, BatteryCharging, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Solar Solutions — Residential, Commercial & Industrial",
  description:
    "Al Rehman Solar offers complete solar solutions for homes, businesses and industries in Lahore — on-grid, off-grid, hybrid solar systems, and UPS services.",
};

const solutions = [
  {
    icon: Home,
    title: "Residential Solar",
    href: "/solutions/residential-solar",
    desc: "Reduce your monthly electricity bills with a solar system designed specifically for your home.",
    benefits: ["Cut electricity bills by up to 80%", "Protection from load shedding", "Increase property value"],
    color: "green",
  },
  {
    icon: Building2,
    title: "Commercial Solar",
    href: "/solutions/commercial-solar",
    desc: "Power your business with clean solar energy and significantly reduce operating costs.",
    benefits: ["Lower operating costs", "Energy independence", "Scalable systems"],
    color: "navy",
  },
  {
    icon: Factory,
    title: "Industrial Solar",
    href: "/solutions/industrial-solar",
    desc: "Large-scale solar solutions for factories, warehouses and industrial facilities in Lahore.",
    benefits: ["Significant cost savings", "High capacity systems", "Custom engineering"],
    color: "solar",
  },
  {
    icon: CloudSun,
    title: "On-Grid Solar",
    href: "/solutions/on-grid",
    desc: "Connected to the utility grid — the most cost-effective option where grid supply is reliable.",
    benefits: ["Lowest upfront cost", "No battery required", "Maximum efficiency"],
    color: "green",
  },
  {
    icon: Battery,
    title: "Off-Grid Solar",
    href: "/solutions/off-grid",
    desc: "Completely independent from the grid — ideal for remote locations or full energy independence.",
    benefits: ["Complete independence", "Works anywhere", "No electricity bills"],
    color: "solar",
  },
  {
    icon: Zap,
    title: "Hybrid Solar",
    href: "/solutions/hybrid",
    desc: "The most popular system in Pakistan — combines solar, batteries, and grid for load shedding protection.",
    benefits: ["Works during load shedding", "Battery backup", "Grid connection available"],
    color: "navy",
  },
  {
    icon: BatteryCharging,
    title: "UPS Services",
    href: "/solutions/ups",
    desc: "UPS installation, battery replacement, and maintenance services for homes and businesses.",
    benefits: ["Instant power backup", "Battery maintenance", "All major brands"],
    color: "green",
  },
];

export default function SolutionsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="Solutions hero">
        <div className="container-main text-center relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
            <Zap className="w-4 h-4" /> Our Solutions
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
            Solar Solutions for Every Need
          </h1>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Whether you&apos;re a homeowner, business owner, or industrial operator — we have the right solar solution for you in Lahore, Pakistan.
          </p>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="section bg-gray-50" aria-labelledby="solutions-heading">
        <div className="container-main">
          <h2 id="solutions-heading" className="sr-only">All Solutions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutions.map(({ icon: Icon, title, href, desc, benefits, color }) => (
              <div key={title} className="card p-6 group flex flex-col">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${
                    color === "green"
                      ? "bg-green-50 group-hover:bg-green-600"
                      : color === "solar"
                      ? "bg-solar-50 group-hover:bg-solar-400"
                      : "bg-navy-50 group-hover:bg-navy-800"
                  } transition-colors duration-300`}
                >
                  <Icon
                    className={`w-6 h-6 group-hover:text-white transition-colors duration-300 ${
                      color === "green"
                        ? "text-green-600"
                        : color === "solar"
                        ? "text-solar-600"
                        : "text-navy-700"
                    }`}
                  />
                </div>
                <h3 className="text-xl font-bold text-navy-900 mb-3 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{desc}</p>
                <ul className="space-y-1.5 mb-5 flex-1">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                      <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className="flex items-center gap-1.5 text-green-600 font-semibold text-sm hover:gap-3 transition-all mt-auto"
                >
                  Learn More <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-950 relative overflow-hidden" aria-label="Get quote CTA">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-main text-center relative z-10">
          <h2 className="section-heading-white mb-4">Not Sure Which System Is Right for You?</h2>
          <p className="section-subheading-white mb-8">
            Our team will assess your energy needs and recommend the most suitable and cost-effective solar solution.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-base px-8 py-4">
              Get Free Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/contact" className="btn-outline-white text-base px-8 py-4">
              Talk to an Expert
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
