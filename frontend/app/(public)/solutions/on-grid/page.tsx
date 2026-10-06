import type { Metadata } from "next";
import Link from "next/link";
import { CloudSun, CheckCircle2, ArrowRight, Zap, CircleDollarSign, AlertTriangle } from "lucide-react";

export const metadata: Metadata = {
  title: "On-Grid Solar System in Lahore — Net Metering",
  description:
    "On-grid solar systems connected to the LESCO/DISCOs grid in Lahore, Pakistan. Benefit from net metering and the lowest-cost solar option available.",
};

export default function OnGridPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="On-grid solar hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                <CloudSun className="w-4 h-4" /> On-Grid Solar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                On-Grid Solar System <span className="gradient-text">in Lahore</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                The most cost-effective solar option — connected to the utility grid with net metering to earn credits for excess energy generation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-base px-8 py-4">
                  Get Free Quote <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/calculator" className="btn-outline-white text-base px-8 py-4">
                  Calculate Savings
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-64 h-64 bg-green-600/10 rounded-full flex items-center justify-center border border-green-500/20">
                <div className="w-40 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-glow-green">
                  <CloudSun className="w-20 h-20 text-white" />
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
            <h2 id="how-it-works-heading" className="section-heading">How On-Grid Solar Works</h2>
          </div>
          <div className="card p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              An on-grid (grid-tied) solar system is directly connected to the utility grid (LESCO in Lahore). During the day, your solar panels generate electricity that powers your home or business. Any excess energy is fed back into the grid, and you receive credits on your electricity bill through <strong>net metering</strong>.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { icon: CloudSun, label: "Solar generates power during day", color: "green" },
                { icon: Zap, label: "Excess power exported to grid", color: "blue" },
                { icon: CircleDollarSign, label: "Net metering credits reduce your bill", color: "green" },
              ].map(({ icon: Icon, label, color }) => (
                <div key={label} className={`p-4 rounded-2xl text-center ${color === "green" ? "bg-green-50" : "bg-blue-50"}`}>
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${color === "green" ? "text-green-600" : "text-blue-600"}`} />
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
                  "Lowest upfront cost — no battery required",
                  "Maximum system efficiency",
                  "Simplest system to install and maintain",
                  "Earn net metering credits from excess generation",
                  "Ideal for daytime-heavy energy users",
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
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> Limitation
              </h3>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="text-sm text-yellow-800">
                  <strong>Does not work during power outages.</strong> On-grid systems automatically shut down during load shedding for safety (anti-islanding protection). If load shedding is a concern, consider a <Link href="/solutions/hybrid" className="text-green-700 hover:underline font-semibold">Hybrid Solar System</Link> instead.
                </p>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Best for: Areas with reliable grid supply and users who are mostly away from home during daytime load shedding hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden" aria-label="CTA">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-main text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
            Get a Free On-Grid Solar Quote
          </h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Contact us for a free consultation and we&apos;ll help you decide if an on-grid system is right for your situation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-white text-base px-8 py-4">
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
