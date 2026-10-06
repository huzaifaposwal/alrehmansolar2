import type { Metadata } from "next";
import Link from "next/link";
import { Building2, CheckCircle2, ArrowRight, Zap, CircleDollarSign, TrendingUp, ShieldCheck, HeadphonesIcon, Sun } from "lucide-react";

export const metadata: Metadata = {
  title: "Commercial Solar System Installation in Lahore",
  description:
    "Reduce your business electricity costs with a professional commercial solar system in Lahore, Pakistan. Get a free assessment from Al Rehman Solar.",
};

const benefits = [
  { icon: CircleDollarSign, title: "Lower Operating Costs", desc: "Significantly reduce one of your biggest overhead costs — electricity." },
  { icon: TrendingUp, title: "Predictable Energy Costs", desc: "Lock in lower energy costs and protect against future electricity price rises." },
  { icon: Zap, title: "Energy Independence", desc: "Reduce reliance on the grid and protect your business from load shedding disruptions." },
  { icon: ShieldCheck, title: "Scalable Systems", desc: "Systems designed to scale with your business growth and changing energy needs." },
  { icon: Sun, title: "Positive Brand Image", desc: "Demonstrate your commitment to sustainability — a growing customer priority." },
  { icon: HeadphonesIcon, title: "Professional Support", desc: "Dedicated after-sales support and maintenance to maximise your ROI." },
];

export default function CommercialSolarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="Commercial solar hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                <Building2 className="w-4 h-4" /> Commercial Solar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                Solar Power for Your <span className="gradient-text">Business in Lahore</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Cut your business electricity costs and achieve energy independence with a professionally installed commercial solar system.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/quote" className="btn-primary text-base px-8 py-4">
                  Get Free Assessment <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/contact" className="btn-outline-white text-base px-8 py-4">
                  Talk to an Expert
                </Link>
              </div>
            </div>
            <div className="hidden lg:flex items-center justify-center">
              <div className="w-64 h-64 bg-navy-800/50 rounded-full flex items-center justify-center border border-white/10">
                <div className="w-40 h-40 bg-gradient-to-br from-navy-700 to-navy-800 rounded-3xl flex items-center justify-center">
                  <Building2 className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white" aria-labelledby="commercial-benefits-heading">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="section-tag"><Zap className="w-4 h-4" /> Business Benefits</span>
            <h2 id="commercial-benefits-heading" className="section-heading">Why Solar Makes Sense for Your Business</h2>
            <p className="section-subheading">
              Electricity is one of the largest costs for businesses in Pakistan. Solar energy is one of the most effective ways to reduce it.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

      {/* Who We Serve */}
      <section className="section bg-gray-50" aria-labelledby="who-we-serve-heading">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-12">
            <span className="section-tag"><Building2 className="w-4 h-4" /> Ideal For</span>
            <h2 id="who-we-serve-heading" className="section-heading">Who We Serve</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              "Retail shops and showrooms",
              "Offices and commercial buildings",
              "Schools, colleges, and universities",
              "Hospitals and clinics",
              "Hotels and restaurants",
              "Warehouses and storage facilities",
              "Petrol stations and service centers",
              "Plazas and shopping centers",
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
          <h2 className="section-heading-white mb-4">Get a Free Commercial Solar Assessment</h2>
          <p className="section-subheading-white mb-8">
            Our team will visit your business premises to assess energy needs, roof space, and provide a detailed proposal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-primary text-base px-8 py-4">
              Request Assessment <ArrowRight className="w-5 h-5" />
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
