"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sun, Target, Eye, Heart, CheckCircle2, Wrench, Users, HeadphonesIcon,
  Building2, Zap, Battery, ShieldCheck, ArrowRight
} from "lucide-react";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};
const stagger = { visible: { transition: { staggerChildren: 0.1 } } };

const services = [
  { icon: Sun, title: "Solar Panel Installation", desc: "On-grid, off-grid, and hybrid solar systems for homes and businesses." },
  { icon: Zap, title: "Solar Inverters", desc: "Supply and installation of quality solar inverters for all system types." },
  { icon: Battery, title: "Battery Storage", desc: "Lithium and lead-acid battery solutions for reliable energy backup." },
  { icon: Building2, title: "Commercial Solar", desc: "Large-scale solar installations for businesses, factories and industrial facilities." },
  { icon: Wrench, title: "UPS Systems", desc: "UPS installation, maintenance and battery replacement services." },
  { icon: HeadphonesIcon, title: "After-Sales Support", desc: "Ongoing technical support, system monitoring and maintenance services." },
];

const approach = [
  { step: "01", title: "Listen First", desc: "We take time to understand your energy needs, budget, and goals before recommending any solution." },
  { step: "02", title: "Honest Assessment", desc: "Our team conducts a thorough site assessment and provides transparent recommendations." },
  { step: "03", title: "Quality Installation", desc: "Professional installation using quality materials and following best practices." },
  { step: "04", title: "Long-Term Partnership", desc: "We stay with you after installation with support, monitoring and maintenance." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden" aria-label="About hero">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/10 rounded-full blur-3xl" />
        </div>
        <div className="container-main text-center relative z-10">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
              <Sun className="w-4 h-4" /> About Us
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-6 font-heading">
              About Al Rehman Solar
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg text-gray-300 max-w-2xl mx-auto">
              A trusted solar energy company based in Lahore, Pakistan — committed to bringing reliable and affordable solar solutions to homes and businesses.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Our Story */}
      <section className="section bg-white" aria-labelledby="story-heading">
        <div className="container-main">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.span variants={fadeUp} className="section-tag">
                <Heart className="w-4 h-4" /> Our Story
              </motion.span>
              <motion.h2 variants={fadeUp} id="story-heading" className="section-heading mb-6">
                Who We Are
              </motion.h2>
              <motion.div variants={fadeUp} className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Al Rehman Solar System & UPS is a solar energy company based in Lahore, Pakistan.
                  We provide solar panel installation, UPS systems, and energy backup solutions to residential,
                  commercial and industrial customers across Lahore and surrounding areas.
                </p>
                <p>
                  Our focus is on providing honest, professional, and technically sound solar solutions
                  that genuinely meet our customers&apos; needs — without overpromising or using high-pressure sales tactics.
                </p>
                <p>
                  We believe solar energy is one of the most practical investments for Pakistani homes and
                  businesses today, given the rising electricity costs and frequent load shedding. Our goal
                  is to make quality solar solutions accessible and understandable for everyone.
                </p>
              </motion.div>
            </motion.div>

            {/* Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-10 text-center">
                <div className="w-24 h-24 bg-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-glow-green">
                  <Sun className="w-12 h-12 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 font-heading mb-2">Al Rehman Solar</h3>
                <p className="text-green-700 font-medium mb-6">System & UPS — Lahore, Pakistan</p>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: "Residential", icon: "🏠" },
                    { label: "Commercial", icon: "🏢" },
                    { label: "Industrial", icon: "🏭" },
                    { label: "UPS Systems", icon: "🔋" },
                  ].map(({ label, icon }) => (
                    <div key={label} className="bg-white rounded-xl p-3 text-center shadow-card">
                      <span className="text-2xl">{icon}</span>
                      <p className="text-sm font-medium text-navy-900 mt-1">{label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="section bg-gray-50" aria-label="Mission and vision">
        <div className="container-main">
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                icon: Target,
                title: "Our Mission",
                color: "green",
                text: "To provide reliable, affordable, and professionally installed solar energy solutions that help homes and businesses in Lahore achieve energy independence and reduce electricity costs.",
              },
              {
                icon: Eye,
                title: "Our Vision",
                color: "navy",
                text: "To be a trusted solar energy partner for communities across Lahore — known for our technical expertise, honest advice, quality installation, and genuine long-term customer support.",
              },
            ].map(({ icon: Icon, title, text, color }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className={cn(
                  "card p-8 border-t-4",
                  color === "green" ? "border-green-600" : "border-navy-800"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center mb-5",
                  color === "green" ? "bg-green-50" : "bg-navy-50"
                )}>
                  <Icon className={cn("w-6 h-6", color === "green" ? "text-green-600" : "text-navy-700")} />
                </div>
                <h2 className="text-xl font-bold text-navy-900 mb-4 font-heading">{title}</h2>
                <p className="text-gray-600 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="section bg-white" aria-labelledby="approach-heading">
        <div className="container-main">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="section-tag">
              <ShieldCheck className="w-4 h-4" /> Our Approach
            </motion.span>
            <motion.h2 variants={fadeUp} id="approach-heading" className="section-heading">
              How We Work With You
            </motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {approach.map(({ step, title, desc }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card p-6 group"
              >
                <div className="text-4xl font-black text-green-100 group-hover:text-green-200 transition-colors mb-3 font-heading">
                  {step}
                </div>
                <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section bg-gray-50" aria-labelledby="services-heading">
        <div className="container-main">
          <motion.div
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
            className="text-center mb-14"
          >
            <motion.span variants={fadeUp} className="section-tag">
              <Zap className="w-4 h-4" /> Services
            </motion.span>
            <motion.h2 variants={fadeUp} id="services-heading" className="section-heading">
              Our Services
            </motion.h2>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="card p-6 group"
              >
                <div className="w-11 h-11 bg-green-50 group-hover:bg-green-600 rounded-xl flex items-center justify-center mb-4 transition-colors">
                  <Icon className="w-5 h-5 text-green-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="font-bold text-navy-900 mb-2 font-heading">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section bg-navy-950 relative overflow-hidden" aria-label="Contact CTA">
        <div className="absolute inset-0 bg-dots opacity-30" />
        <div className="container-main text-center relative z-10">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
            <motion.h2 variants={fadeUp} className="section-heading-white mb-4">
              Ready to Work With Us?
            </motion.h2>
            <motion.p variants={fadeUp} className="section-subheading-white mb-8">
              Get in touch for a free consultation and honest advice about solar for your home or business.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/quote" className="btn-primary px-8 py-4">
                Get Free Quote <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/contact" className="btn-outline-white px-8 py-4">
                Contact Us
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
