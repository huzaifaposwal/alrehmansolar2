import type { Metadata } from "next";
import Link from "next/link";
import { Battery, CheckCircle2, ArrowRight, Zap, ShieldCheck, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "Off-Grid Solar System in Lahore — Complete Energy Independence",
  description:
    "Off-grid solar systems for remote locations and complete energy independence in Lahore and across Pakistan. No grid needed — powered entirely by solar and battery.",
};

export default function OffGridPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="Off-grid solar hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-solar-400/20 border border-solar-400/30 text-solar-400 text-sm font-medium rounded-full mb-6">
                <Battery className="w-4 h-4" /> Off-Grid Solar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                Off-Grid Solar System — <span className="gradient-text">Complete Independence</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Completely independent from the electricity grid. Powered 100% by solar panels and battery storage — ideal for remote locations with no grid access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-base px-8 py-4">
                  Get Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline-white text-base px-8 py-4">
                  Talk to an Expert
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-64 h-64 bg-solar-400/10 rounded-full flex items-center justify-center border border-solar-400/20">
                <div className="w-40 h-40 bg-gradient-to-br from-solar-400 to-solar-500 rounded-3xl flex items-center justify-center">
                  <Battery className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="section bg-white" aria-labelledby="how-it-works-heading">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-14">
            <span className="section-tag"><Zap className="w-4 h-4" /> How It Works</span>
            <h2 id="how-it-works-heading" className="section-heading">How Off-Grid Solar Works</h2>
          </div>
          <div className="card p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              An off-grid solar system is completely independent from the electricity grid. Solar panels charge a battery bank during the day. The stored energy in the batteries powers your home or business at night and during cloudy days — without any connection to LESCO or any utility.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Solar panels charge battery bank during daylight", icon: "☀️" },
                { label: "Battery stores energy for use at any time", icon: "🔋" },
                { label: "Inverter converts DC power to usable AC power", icon: "⚡" },
              ].map(({ label, icon }) => (
                <div key={label} className="bg-solar-50 p-4 rounded-2xl text-center">
                  <span className="text-3xl mb-2 block">{icon}</span>
                  <p className="text-sm font-medium text-gray-700">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 font-heading flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" /> Advantages
              </h3>
              <ul className="space-y-2">
                {[
                  "Complete energy independence",
                  "Works in remote locations with no grid access",
                  "No electricity bills whatsoever",
                  "Protection from all power outages",
                  "Ideal for farms, remote properties",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                    <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-navy-900 mb-4 font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Consideration
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Higher upfront cost.</strong> Off-grid systems require a large battery bank which significantly increases cost. For urban homes in Lahore with grid access, a <Link href="/solutions/hybrid" className="text-green-700 hover:underline font-semibold">Hybrid Solar System</Link> is usually the more cost-effective solution.
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Best for: Remote farms, village homes, areas with no grid access, or users who want 100% grid independence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Best For */}
      <section className="section bg-gray-50" aria-labelledby="best-for-heading">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-12">
            <span className="section-tag"><ShieldCheck className="w-4 h-4" /> Ideal Use Cases</span>
            <h2 id="best-for-heading" className="section-heading">Who Is Off-Grid Solar For?</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Remote farms and agricultural land",
              "Village homes with no grid access",
              "Construction sites and remote offices",
              "Forest areas and eco-lodges",
              "Telecom towers and remote installations",
              "Holiday homes and off-grid retreats",
            ].map((item) => (
              <div key={item} className="flex items-center gap-3 p-4 bg-white rounded-xl shadow-card">
                <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                <span className="text-gray-700 font-medium text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-950 relative overflow-hidden" aria-label="CTA">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-main text-center relative z-10">
          <h2 className="section-heading-white mb-4">Interested in an Off-Grid System?</h2>
          <p className="section-subheading-white mb-8">
            Get in touch and we&apos;ll design the right off-grid solar solution for your specific location and energy needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-base px-8 py-4">
              Get Free Quote <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/solutions" className="btn-outline-white text-base px-8 py-4">
              Compare All Systems
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
