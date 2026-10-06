"use client";

import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, Calculator, Sun, Zap, ShieldCheck, Wrench, Users, HeadphonesIcon,
  CheckCircle2, Star, ChevronRight, Leaf, TrendingUp, Home, Building2, Factory,
  Battery, CircleDollarSign, CloudSun
} from "lucide-react";
import { useState } from "react";
import { cn, getWhatsAppLink } from "@/lib/utils";

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

// ─── Static Data ──────────────────────────────────────────────────────────────

const stats = [
  { key: "stat_projects_completed", label: "Projects Completed", suffix: "+", icon: CheckCircle2 },
  { key: "stat_installed_capacity_kw", label: "kW Installed", suffix: "+", icon: Zap },
  { key: "stat_years_experience", label: "Years Experience", suffix: "+", icon: Star },
  { key: "stat_happy_customers", label: "Happy Customers", suffix: "+", icon: Users },
];

const whyUs = [
  { icon: ShieldCheck, title: "Professional Installation", desc: "Certified technicians with years of hands-on solar installation experience." },
  { icon: Star, title: "Quality Products", desc: "We source from reputable manufacturers to ensure system reliability and longevity." },
  { icon: Wrench, title: "Customized Solutions", desc: "Every system is designed specifically for your energy needs and property." },
  { icon: HeadphonesIcon, title: "Technical Support", desc: "Dedicated after-sales support to keep your system running at peak performance." },
  { icon: Users, title: "Transparent Consultation", desc: "Honest, detailed consultations — no high-pressure tactics, just clear advice." },
  { icon: CheckCircle2, title: "After-Sales Support", desc: "We stay with you long after installation, providing monitoring and maintenance." },
];

const solutions = [
  {
    icon: Home,
    title: "Residential Solar",
    href: "/solutions/residential-solar",
    desc: "Cut your electricity bills with a solar system designed for your home.",
    benefits: ["Reduce monthly bills", "Protection from load shedding", "Increase home value"],
    gradient: "from-green-600 to-green-700",
  },
  {
    icon: Building2,
    title: "Commercial Solar",
    href: "/solutions/commercial-solar",
    desc: "Power your business with clean solar energy and reduce operating costs.",
    benefits: ["Lower operating costs", "Energy independence", "Scalable systems"],
    gradient: "from-navy-700 to-navy-800",
  },
  {
    icon: Factory,
    title: "Industrial Solar",
    href: "/solutions/industrial-solar",
    desc: "Large-scale solar solutions for factories, warehouses and industrial facilities.",
    benefits: ["Significant cost savings", "High capacity systems", "Custom engineering"],
    gradient: "from-solar-500 to-solar-600",
  },
];

const systemTypes = [
  {
    icon: CloudSun,
    title: "On-Grid Solar",
    href: "/solutions/on-grid",
    howItWorks: "Connected to the utility grid. Generates solar power during the day and uses grid power at night.",
    bestFor: "Locations with reliable grid supply and net metering",
    benefits: ["Lowest system cost", "No battery needed", "Maximum efficiency"],
    limitation: "Does not work during power outages",
    color: "green",
  },
  {
    icon: Battery,
    title: "Off-Grid Solar",
    href: "/solutions/off-grid",
    howItWorks: "Completely independent from the grid. Uses batteries to store solar energy for use at any time.",
    bestFor: "Remote locations with no grid access",
    benefits: ["Complete energy independence", "Works anywhere", "No electricity bills"],
    limitation: "Higher upfront cost due to battery bank",
    color: "solar",
  },
  {
    icon: Zap,
    title: "Hybrid Solar",
    href: "/solutions/hybrid",
    howItWorks: "Combines solar panels, batteries, and grid connection. Most popular in Pakistan for load shedding protection.",
    bestFor: "Areas with frequent load shedding — ideal for most Pakistani homes",
    benefits: ["Works during load shedding", "Battery backup", "Grid connection available"],
    limitation: "Higher cost than on-grid due to batteries",
    color: "navy",
  },
];

const workingProcess = [
  { step: 1, title: "Consultation", desc: "We discuss your energy needs, budget, and goals.", icon: Users },
  { step: 2, title: "Site Assessment", desc: "Our team visits to assess your roof, load, and location.", icon: Home },
  { step: 3, title: "System Design", desc: "We design a customized solar system for your needs.", icon: Zap },
  { step: 4, title: "Installation", desc: "Professional installation by our certified technicians.", icon: Wrench },
  { step: 5, title: "Support", desc: "Ongoing monitoring, maintenance, and after-sales support.", icon: HeadphonesIcon },
];

const faqs = [
  {
    q: "What is a hybrid solar system?",
    a: "A hybrid solar system combines solar panels, an inverter, and battery storage. It can use solar energy during the day and provide backup power when grid electricity is unavailable.",
  },
  {
    q: "Can solar work during load shedding?",
    a: "Yes, but the behavior depends on the system type. Hybrid and off-grid systems can provide backup during load shedding when properly configured with battery storage. Standard on-grid systems generally shut down when the grid is unavailable.",
  },
  {
    q: "How many solar panels does a typical home need?",
    a: "The number depends on your home's electricity consumption, required system capacity, panel wattage, available roof space, and appliance usage. A professional assessment is recommended before selecting the panel quantity.",
  },
  {
    q: "How long does installation take?",
    a: "Installation time depends on the system size, roof structure, equipment availability, and site conditions. A typical residential installation can often be completed within a short installation window after the site is prepared.",
  },
  {
    q: "How much does a solar system cost in Lahore?",
    a: "The cost depends on system capacity, solar panels, inverter, batteries, mounting structure, installation, and other components. We assess your electricity usage and requirements before preparing a suitable quotation.",
  },
  {
    q: "How much can I save on my electricity bill with solar?",
    a: "Savings depend on your electricity consumption, system size, sunlight availability, electricity tariff, and system configuration. A properly sized solar system can reduce your dependence on grid electricity and lower your electricity costs.",
  },
  {
    q: "What is net metering and how does it work?",
    a: "Net metering allows eligible solar users to export surplus electricity to the electricity grid. The exported electricity is accounted for according to the applicable regulations and billing arrangement.",
  },
  {
    q: "Can I get net metering with LESCO?",
    a: "Eligible LESCO consumers can apply for solar net metering subject to the applicable requirements, approvals, and regulations. The process involves documentation, technical requirements, and approval from the relevant authorities.",
  },
  {
    q: "Do I need batteries for my solar system?",
    a: "Not necessarily. On-grid systems normally operate without batteries, while hybrid and off-grid systems can use batteries for backup. The best option depends on your backup requirements, electricity usage, and budget.",
  },
  {
    q: "What size solar system does my home need?",
    a: "The required system size depends on your monthly electricity consumption, appliances, available roof space, and backup requirements. A site assessment and electricity-usage review can help determine the appropriate capacity.",
  },
  {
    q: "Does solar work on cloudy or rainy days?",
    a: "Yes. Solar panels can still generate electricity during cloudy and rainy weather, but their output is usually lower because less sunlight reaches the panels.",
  },
  {
    q: "How often do solar panels need cleaning?",
    a: "Cleaning frequency depends on dust, pollution, weather, and the installation location. In dusty or polluted areas, regular cleaning can help maintain efficient panel performance.",
  },
  {
    q: "How long do solar panels and inverters last?",
    a: "Solar panels are designed for long-term operation and generally have long performance warranties. Inverter lifespan varies by model, operating conditions, and maintenance.",
  },
  {
    q: "Can solar run ACs and other heavy appliances?",
    a: "Yes. A properly designed solar system can power ACs, refrigerators, water pumps, and other appliances. The inverter and total system capacity must be selected according to the appliances' power requirements.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923006639477";

  return (
    <>
      {/* ════════════════════════════════════════════
          HERO SECTION
      ════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden bg-gradient-hero bg-dots"
        aria-label="Hero section"
      >
        {/* Animated background orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-green-600/20 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-solar-400/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
          <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-navy-600/30 rounded-full blur-3xl" />
        </div>

        <div className="container-main relative z-10 pt-24 pb-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left: Text */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="text-center lg:text-left"
            >
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                  <Sun className="w-4 h-4" />
                  Professional Solar & UPS Solutions in Lahore
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-white leading-tight mb-6"
              >
                Power Your Future{" "}
                <span className="gradient-text">With Solar Energy</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
                Reliable solar solutions for homes, businesses and industries in Lahore.
                Reduce your electricity bills and achieve energy independence.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/quote" className="btn-primary text-base px-8 py-4">
                  Get Free Quote
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link href="/calculator" className="btn-outline-white text-base px-8 py-4">
                  <Calculator className="w-5 h-5" />
                  Calculate Your Savings
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div variants={fadeUp} className="flex flex-wrap gap-6 mt-10 justify-center lg:justify-start">
                {[
                  { icon: ShieldCheck, label: "Professional Team" },
                  { icon: Zap, label: "Quality Products" },
                  { icon: HeadphonesIcon, label: "After-Sales Support" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-gray-400 text-sm">
                    <Icon className="w-4 h-4 text-green-400" />
                    {label}
                  </div>
                ))}
              </motion.div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glow ring */}
                <div className="absolute inset-0 rounded-full bg-green-600/10 animate-pulse-slow" />
                <div className="absolute inset-8 rounded-full bg-solar-400/10 animate-spin-slow" style={{ border: "1px solid rgba(251,191,36,0.2)" }} />

                {/* Center icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-to-br from-green-600 to-green-700 rounded-3xl flex items-center justify-center shadow-glow-green animate-float">
                    <Sun className="w-20 h-20 text-white" />
                  </div>
                </div>

                {/* Floating stat cards */}
                {[
                  { label: "Energy Saved", value: "Est. 80%", pos: "top-8 -left-4", color: "green" },
                  { label: "CO₂ Reduced", value: "Est. 2 tons/yr", pos: "bottom-16 -left-8", color: "solar" },
                  { label: "Load Shedding", value: "Protected", pos: "top-16 -right-4", color: "navy" },
                ].map(({ label, value, pos, color }) => (
                  <div
                    key={label}
                    className={cn(
                      "absolute glass-card px-4 py-3 shadow-glass",
                      pos
                    )}
                  >
                    <p className={cn(
                      "text-xs font-medium",
                      color === "green" ? "text-green-400" : color === "solar" ? "text-solar-400" : "text-blue-400"
                    )}>
                      {label}
                    </p>
                    <p className="text-white font-bold text-sm">{value}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500">
          <span className="text-xs font-medium">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-gray-500 to-transparent" />
        </div>
      </section>

      {/* ════════════════════════════════════════════
          STATS SECTION
      ════════════════════════════════════════════ */}
      <section className="py-12 bg-white border-b border-gray-100" aria-label="Business statistics">
        <div className="container-main">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map(({ label, suffix, icon: Icon }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-3xl font-bold text-navy-900 font-heading mb-1">
                  —{suffix}
                </div>
                <p className="text-sm text-gray-600">{label}</p>
                <p className="text-xs text-gray-400 mt-1">Admin configurable</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          WHY CHOOSE US
      ════════════════════════════════════════════ */}
      <section className="section bg-gray-50" aria-labelledby="why-us-heading">
        <div className="container-main">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="section-tag">
              <ShieldCheck className="w-4 h-4" /> Why Choose Us
            </motion.span>
            <motion.h2 variants={fadeUp} id="why-us-heading" className="section-heading">
              Why Choose Al Rehman Solar?
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading">
              We combine technical expertise, quality products, and genuine customer care to deliver solar solutions you can rely on.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {whyUs.map(({ icon: Icon, title, desc }) => (
              <motion.div key={title} variants={fadeUp} className="card p-6 group">
                <div className="w-12 h-12 bg-green-50 group-hover:bg-green-600 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-300">
                  <Icon className="w-6 h-6 text-green-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SOLAR SOLUTIONS
      ════════════════════════════════════════════ */}
      <section className="section bg-white" aria-labelledby="solutions-heading">
        <div className="container-main">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="section-tag">
              <Zap className="w-4 h-4" /> Our Solutions
            </motion.span>
            <motion.h2 variants={fadeUp} id="solutions-heading" className="section-heading">
              Solar Solutions for Every Need
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading">
              Whether you are a homeowner, business owner or industrial operator, we have the right solar solution.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {solutions.map(({ icon: Icon, title, href, desc, benefits, gradient }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card group overflow-hidden"
              >
                <div className={cn("h-40 bg-gradient-to-br flex items-center justify-center", gradient)}>
                  <Icon className="w-16 h-16 text-white/80 group-hover:scale-110 transition-transform duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-navy-900 mb-3 font-heading">{title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">{desc}</p>
                  <ul className="space-y-1.5 mb-5">
                    {benefits.map((b) => (
                      <li key={b} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>
                  <Link href={href} className="flex items-center gap-1.5 text-green-600 font-semibold text-sm hover:gap-3 transition-all">
                    Learn More <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          SYSTEM TYPES
      ════════════════════════════════════════════ */}
      <section className="section bg-navy-950" aria-labelledby="system-types-heading">
        <div className="container-main">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 border border-white/20 text-green-400 text-sm font-semibold rounded-full mb-4">
              <Zap className="w-4 h-4" /> System Types
            </motion.span>
            <motion.h2 variants={fadeUp} id="system-types-heading" className="section-heading-white">
              Which Solar System Is Right For You?
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading-white">
              Understanding the difference helps you make the right investment for your situation.
            </motion.p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {systemTypes.map(({ icon: Icon, title, href, howItWorks, bestFor, benefits, limitation, color }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="card-dark p-6 group"
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-5",
                  color === "green" ? "bg-green-600/20" : color === "solar" ? "bg-solar-400/20" : "bg-blue-400/20"
                )}>
                  <Icon className={cn(
                    "w-6 h-6",
                    color === "green" ? "text-green-400" : color === "solar" ? "text-solar-400" : "text-blue-400"
                  )} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3 font-heading">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">{howItWorks}</p>
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Best For</p>
                  <p className="text-gray-300 text-sm">{bestFor}</p>
                </div>
                <ul className="space-y-1.5 mb-4">
                  {benefits.map((b) => (
                    <li key={b} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl mb-5">
                  <span className="text-yellow-400 text-xs">⚠</span>
                  <p className="text-gray-400 text-xs">{limitation}</p>
                </div>
                <Link href={href} className="flex items-center gap-1.5 text-green-400 font-semibold text-sm hover:gap-3 transition-all">
                  Learn More <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          CALCULATOR CTA
      ════════════════════════════════════════════ */}
      <section className="section bg-gradient-to-br from-green-600 to-green-700 relative overflow-hidden" aria-label="Calculator call to action">
        <div className="absolute inset-0 bg-dots opacity-20" />
        <div className="container-main text-center relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <CircleDollarSign className="w-16 h-16 text-white/80 mx-auto mb-6" />
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-bold text-white mb-4 font-heading">
              Find Out How Much You Can Save With Solar
            </motion.h2>
            <motion.p variants={fadeUp} className="text-green-100 text-lg mb-8 max-w-2xl mx-auto">
              Use our free solar calculator to get an estimated system size, monthly savings, and payback period based on your electricity usage.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/calculator" className="btn-white text-base px-8 py-4">
                <Calculator className="w-5 h-5" />
                Calculate Now — It&apos;s Free
              </Link>
              <Link href="/quote" className="btn-outline-white text-base px-8 py-4">
                Get Free Quote Instead
              </Link>
            </motion.div>
            <motion.p variants={fadeUp} className="text-green-200/70 text-xs mt-6">
              * Calculator provides estimates only. Contact us for a professional on-site assessment.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          PROCESS
      ════════════════════════════════════════════ */}
      <section className="section bg-white" aria-labelledby="process-heading">
        <div className="container-main">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="section-tag">
              <CheckCircle2 className="w-4 h-4" /> Our Process
            </motion.span>
            <motion.h2 variants={fadeUp} id="process-heading" className="section-heading">
              How We Work
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading">
              A simple, professional process from first contact to your system going live.
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Connecting line */}
            <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-green-300 to-transparent" />

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-8">
              {workingProcess.map(({ step, title, desc, icon: Icon }, i) => (
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center relative"
                >
                  <div className="w-20 h-20 mx-auto mb-4 bg-green-50 rounded-full flex items-center justify-center border-4 border-white shadow-card relative z-10">
                    <Icon className="w-8 h-8 text-green-600" />
                    <span className="absolute -top-1 -right-1 w-6 h-6 bg-green-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {step}
                    </span>
                  </div>
                  <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FAQ
      ════════════════════════════════════════════ */}
      <section className="section bg-gray-50" aria-labelledby="faq-heading">
        <div className="container-main max-w-3xl">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-12"
          >
            <motion.span variants={fadeUp} className="section-tag">FAQ</motion.span>
            <motion.h2 variants={fadeUp} id="faq-heading" className="section-heading">
              Frequently Asked Questions
            </motion.h2>
          </motion.div>

          <div className="space-y-3.5">
            {faqs.map(({ q, a }, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: Math.min(i * 0.03, 0.3) }}
                className="card overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 md:p-6 text-left transition-colors hover:bg-gray-50/50"
                  aria-expanded={openFaq === i}
                >
                  <span className="font-semibold text-navy-900 text-base md:text-lg pr-4 leading-snug">
                    {q}
                  </span>
                  <ChevronRight
                    className={cn(
                      "w-5 h-5 text-green-600 flex-shrink-0 transition-transform duration-300 ease-in-out",
                      openFaq === i ? "rotate-90" : ""
                    )}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {openFaq === i && (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 md:px-6 md:pb-6 text-gray-600 text-sm md:text-base leading-relaxed border-t border-gray-100 pt-4">
                        {a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/contact" className="btn-secondary">
              Have More Questions? Contact Us
            </Link>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════
          FINAL CTA
      ════════════════════════════════════════════ */}
      <section className="section bg-gradient-hero relative overflow-hidden bg-dots" aria-label="Final call to action">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-solar-400/10 rounded-full blur-3xl" />
        </div>
        <div className="container-main text-center relative z-10">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
          >
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
                <Leaf className="w-4 h-4" /> Go Solar Today
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="section-heading-white mb-4">
              Ready to Switch to Solar?
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading-white mb-10">
              Contact our team for a free consultation and discover how solar can work for your home or business.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote" className="btn-primary text-base px-8 py-4">
                Get Free Quote
                <ArrowRight className="w-5 h-5" />
              </Link>
              <a
                href={getWhatsAppLink(WHATSAPP, "Hi! I'd like to learn more about your solar solutions.")}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline-white text-base px-8 py-4"
              >
                Talk to an Expert
              </a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
