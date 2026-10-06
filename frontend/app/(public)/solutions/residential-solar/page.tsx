import type { Metadata } from "next";
import Link from "next/link";
import { Home, CheckCircle2, ArrowRight, Sun, Zap, Battery, ShieldCheck, HeadphonesIcon, CircleDollarSign, TrendingUp } from "lucide-react";

export const metadata: Metadata = {
  title: "Residential Solar System Installation in Lahore",
  description:
    "Professional residential solar panel installation in Lahore, Pakistan. Cut your electricity bills by up to 80% with a hybrid solar system designed for your home.",
};

const benefits = [
  { icon: CircleDollarSign, title: "Reduce Electricity Bills", desc: "Cut monthly electricity bills by 50–80% depending on system size and usage." },
  { icon: Zap, title: "Load Shedding Protection", desc: "With a hybrid system, your home stays powered even during load shedding." },
  { icon: TrendingUp, title: "Increase Property Value", desc: "Solar installations are a proven investment that increases your home's market value." },
  { icon: ShieldCheck, title: "Quality Equipment", desc: "We use reliable panels and inverters from reputable manufacturers with warranties." },
  { icon: HeadphonesIcon, title: "Professional Installation", desc: "Certified technicians ensure your system is installed safely and optimally." },
  { icon: Battery, title: "After-Sales Support", desc: "Ongoing monitoring, maintenance, and support after your system is live." },
];

const systemOptions = [
  {
    title: "3 kW System",
    suitable: "Small homes, 1–2 rooms",
    panels: "6–8 panels",
    savings: "Moderate bill reduction",
  },
  {
    title: "5 kW System",
    suitable: "Average Pakistani home",
    panels: "10–14 panels",
    savings: "Significant bill reduction",
  },
  {
    title: "10 kW System",
    suitable: "Larger homes or high usage",
    panels: "20–26 panels",
    savings: "Maximum bill reduction",
  },
];

export default function ResidentialSolarPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="Residential solar hero">
        <div className="container-main relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                <Home className="w-4 h-4" /> Residential Solar
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading leading-tight">
                Solar Panels for Your <span className="gradient-text">Home in Lahore</span>
              </h1>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Reduce your electricity bills and protect your family from load shedding with a professional solar system installed by Al Rehman Solar.
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
              <div className="w-64 h-64 bg-green-600/20 rounded-full flex items-center justify-center border border-green-500/20">
                <div className="w-40 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-glow-green">
                  <Home className="w-20 h-20 text-white" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section bg-white" aria-labelledby="benefits-heading">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="section-tag"><Sun className="w-4 h-4" /> Why Go Solar?</span>
            <h2 id="benefits-heading" className="section-heading">Benefits of Residential Solar</h2>
            <p className="section-subheading">
              A solar system is one of the best investments you can make for your home in Pakistan today.
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

      {/* System Options */}
      <section className="section bg-gray-50" aria-labelledby="system-options-heading">
        <div className="container-main">
          <div className="text-center mb-14">
            <span className="section-tag"><Zap className="w-4 h-4" /> System Sizes</span>
            <h2 id="system-options-heading" className="section-heading">Common Residential System Sizes</h2>
            <p className="section-subheading">
              Use our solar calculator to find the exact size for your home&apos;s energy consumption.
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {systemOptions.map(({ title, suitable, panels, savings }) => (
              <div key={title} className="card p-6 text-center">
                <div className="text-3xl font-black text-green-600 mb-3 font-heading">{title}</div>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-semibold text-navy-900">Suitable for:</span> {suitable}</p>
                  <p><span className="font-semibold text-navy-900">Panels required:</span> {panels}</p>
                  <p><span className="font-semibold text-navy-900">Savings:</span> {savings}</p>
                </div>
                <Link href="/quote" className="btn-primary w-full justify-center mt-5 text-sm py-2.5">
                  Get Quote
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-gray-400 mt-6">
            * Exact sizing depends on your monthly consumption. Use our{" "}
            <Link href="/calculator" className="text-green-600 hover:underline">solar calculator</Link> for a personalized estimate.
          </p>
        </div>
      </section>

      {/* Process */}
      <section className="section bg-white" aria-labelledby="process-heading">
        <div className="container-main max-w-4xl">
          <div className="text-center mb-14">
            <span className="section-tag"><CheckCircle2 className="w-4 h-4" /> Simple Process</span>
            <h2 id="process-heading" className="section-heading">How to Get Started</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Get a Free Quote", desc: "Fill out our form and we'll get back to you within 24 hours." },
              { step: "2", title: "Site Assessment", desc: "Our team visits your home to assess roof space, load, and the best system for you." },
              { step: "3", title: "Installation", desc: "Professional installation typically completed within 1–3 days." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-16 h-16 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-black mx-auto mb-4 font-heading">
                  {step}
                </div>
                <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden" aria-label="CTA">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-main text-center relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">Ready to Go Solar?</h2>
          <p className="text-green-100 text-lg mb-8 max-w-xl mx-auto">
            Get a free consultation and quote for your home solar system in Lahore.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/quote" className="btn-white text-base px-8 py-4">
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
