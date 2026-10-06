import type { Metadata } from "next";
import Link from "next/link";
import { Factory, CheckCircle2, ArrowRight, Zap, CircleDollarSign, Settings, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Industrial Solar System Installation in Lahore",
  description:
    "Large-scale industrial solar systems for factories, warehouses, and industrial facilities in Lahore, Pakistan. Custom engineering by Al Rehman Solar.",
};

const benefits = [
  { icon: CircleDollarSign, title: "Significant Cost Savings", desc: "Industrial facilities consume vast amounts of electricity. Solar delivers substantial and immediate cost reductions." },
  { icon: Zap, title: "High Capacity Systems", desc: "We design and install large-scale systems from 50 kW to multi-megawatt capacity for industrial sites." },
  { icon: Settings, title: "Custom Engineering", desc: "Each industrial installation is uniquely engineered to match your load profile, roof structure, and energy goals." },
  { icon: ShieldCheck, title: "Regulatory Compliance", desc: "We handle all LESCO/DISCOs net metering applications and ensure compliance with local regulations." },
];

export default function IndustrialSolarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="Industrial solar hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                <Factory className="w-4 h-4" /> Industrial Solar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                Large-Scale Solar for <span className="gradient-text">Industrial Facilities</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Dramatically reduce energy costs for your factory, warehouse or industrial facility with a custom-engineered solar system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-base px-8 py-4">
                  Request Site Survey <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline-white text-base px-8 py-4">
                  Talk to an Engineer
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-64 h-64 bg-solar-400/10 rounded-full flex items-center justify-center border border-solar-400/20">
                <div className="w-40 h-40 bg-gradient-to-br from-solar-500 to-solar-600 rounded-3xl flex items-center justify-center">
                  <Factory className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white" aria-labelledby="industrial-benefits-heading">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="section-tag"><Zap className="w-4 h-4" /> Industrial Benefits</span>
            <h2 id="industrial-benefits-heading" className="section-heading">Why Industrial Solar Makes Sense</h2>
            <p className="section-subheading">
              Industrial and manufacturing facilities in Pakistan are among the hardest hit by rising energy costs. Solar offers a reliable solution.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {benefits.map(({ icon: Icon, title, desc }) => (
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

      {/* Industries */}
      <section className="section bg-gray-50" aria-labelledby="industries-heading">
        <div className="container-main max-w-3xl">
          <div className="text-center mb-12">
            <span className="section-tag"><Factory className="w-4 h-4" /> Industries We Serve</span>
            <h2 id="industries-heading" className="section-heading">Sectors We Work With</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Textile and garment factories",
              "Food processing plants",
              "Pharmaceutical manufacturers",
              "Steel and metal fabrication",
              "Cold storage and refrigeration",
              "Printing and packaging facilities",
              "Plastic and rubber manufacturing",
              "Logistics and distribution centers",
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
          <h2 className="section-heading-white mb-4">Request an Industrial Solar Site Survey</h2>
          <p className="section-subheading-white mb-8">
            Our engineering team will conduct a detailed site survey and provide a comprehensive proposal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-base px-8 py-4">
              Request Survey <ArrowRight className="w-5 h-5" />
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
