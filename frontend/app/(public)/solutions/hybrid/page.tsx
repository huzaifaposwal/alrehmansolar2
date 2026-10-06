import type { Metadata } from "next";
import Link from "next/link";
import { Zap, CheckCircle2, ArrowRight, Battery, CloudSun, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Hybrid Solar System in Lahore — Best for Load Shedding",
  description:
    "Hybrid solar systems are the most popular choice for Pakistani homes and businesses. Combines solar, battery backup, and grid connection for complete protection from load shedding.",
};

export default function HybridSolarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="Hybrid solar hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-400/20 border border-blue-400/30 text-blue-400 text-sm font-medium rounded-full mb-6">
                <Star className="w-4 h-4" /> Most Popular in Pakistan
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                Hybrid Solar System — <span className="gradient-text">Best for Pakistan</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                The most popular solar solution in Pakistan — combines solar panels, battery storage, and grid connection for complete protection from load shedding.
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
              <div className="w-64 h-64 bg-blue-400/10 rounded-full flex items-center justify-center border border-blue-400/20">
                <div className="w-40 h-40 bg-gradient-to-br from-blue-600 to-navy-800 rounded-3xl flex items-center justify-center">
                  <Zap className="w-20 h-20 text-white" />
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
            <h2 id="how-it-works-heading" className="section-heading">How a Hybrid Solar System Works</h2>
          </div>
          <div className="card p-8 mb-8">
            <p className="text-gray-700 leading-relaxed text-lg mb-6">
              A hybrid solar system combines the best of both worlds — solar panels, a battery bank, and a grid connection. During the day, solar panels power your home and charge the batteries. During load shedding or at night, the batteries take over seamlessly. When both solar and batteries are available, the grid acts as a backup.
            </p>
            <div className="grid sm:grid-cols-4 gap-4">
              {[
                { label: "Solar panels generate power", icon: <CloudSun className="w-6 h-6" /> },
                { label: "Batteries charged for backup", icon: <Battery className="w-6 h-6" /> },
                { label: "Home stays powered 24/7", icon: "🏠" },
                { label: "Grid as additional backup", icon: "🔌" },
              ].map(({ label, icon }) => (
                <div key={label} className="bg-blue-50 p-4 rounded-2xl text-center">
                  <div className="flex justify-center mb-2 text-blue-600">
                    {typeof icon === "string" ? <span className="text-3xl">{icon}</span> : icon}
                  </div>
                  <p className="text-xs font-medium text-gray-700">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why It's the Best Choice */}
          <div className="card p-6 bg-green-50 border border-green-200">
            <h3 className="font-bold text-navy-900 mb-4 font-heading flex items-center gap-2">
              <Star className="w-5 h-5 text-green-600" /> Why Hybrid Is the Most Popular Choice in Pakistan
            </h3>
            <ul className="space-y-2">
              {[
                "Works perfectly during load shedding — your home never loses power",
                "Reduces electricity bills by using solar during peak hours",
                "Battery backup ensures power through the night",
                "Grid connection means you're never completely without power",
                "Net metering available in most areas (export excess solar to grid)",
                "Best return on investment for most Pakistani homes and businesses",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* System Sizes */}
      <section className="section bg-gray-50" aria-labelledby="sizes-heading">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-14">
            <span className="section-tag"><Zap className="w-4 h-4" /> System Sizes</span>
            <h2 id="sizes-heading" className="section-heading">Popular Hybrid System Sizes</h2>
            <p className="section-subheading">
              Use our <Link href="/calculator" className="text-green-600 hover:underline">solar calculator</Link> for a personalized recommendation.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { capacity: "5 kW", backup: "~4–6 hours", suitable: "Average home (3–4 rooms)", panels: "10–14 panels" },
              { capacity: "10 kW", backup: "~6–8 hours", suitable: "Larger home or small business", panels: "20–26 panels" },
              { capacity: "20 kW+", backup: "Custom", suitable: "Large business or industrial", panels: "Custom design" },
            ].map(({ capacity, backup, suitable, panels }) => (
              <div key={capacity} className="card p-6 text-center">
                <div className="text-3xl font-black text-blue-600 mb-3 font-heading">{capacity}</div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold text-navy-900">Battery backup:</span> {backup}</p>
                  <p><span className="font-semibold text-navy-900">Suitable for:</span> {suitable}</p>
                  <p><span className="font-semibold text-navy-900">Panels:</span> {panels}</p>
                </div>
                <Link href="/quote" className="btn-primary w-full justify-center mt-5 text-sm py-2.5">
                  Get Quote
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-hero relative overflow-hidden bg-dots" aria-label="CTA">
        <div className="container-main text-center relative z-10">
          <h2 className="section-heading-white mb-4">Get Your Hybrid Solar System Today</h2>
          <p className="section-subheading-white mb-8">
            Say goodbye to load shedding and high electricity bills. Contact us for a free consultation.
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
