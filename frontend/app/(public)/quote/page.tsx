"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FileText, CheckCircle2, Sun } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function QuotePage() {
  const [form, setForm] = useState({
    full_name: "", phone: "", email: "", city: "Lahore",
    property_type: "residential", monthly_bill: "", monthly_units: "",
    preferred_system: "hybrid", roof_size: "", message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name || !form.phone) {
      toast.error("Please enter your name and phone number.");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        phone: form.phone,
        email: form.email || undefined,
        city: form.city,
        property_type: form.property_type,
        monthly_bill: form.monthly_bill ? parseFloat(form.monthly_bill) : undefined,
        monthly_units: form.monthly_units ? parseFloat(form.monthly_units) : undefined,
        preferred_system: form.preferred_system,
        roof_size: form.roof_size ? parseFloat(form.roof_size) : undefined,
        message: form.message || undefined,
        source: "quote_page",
      };
      try {
        await api.submitQuote(payload);
      } catch {
        await api.submitLead(payload);
      }
      setSubmitted(true);
    } catch {
      toast.error("Something went wrong. Please try calling us directly.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-24 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-10 max-w-lg text-center">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-navy-900 mb-3 font-heading">Quote Request Received!</h1>
          <p className="text-gray-600 mb-6">
            Thank you, <strong>{form.full_name}</strong>! We have received your request and will contact you at <strong>{form.phone}</strong> to discuss your solar requirements.
          </p>
          <p className="text-sm text-gray-500">
            You can also reach us directly on WhatsApp or by phone if you need an immediate response.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-16 bg-dots overflow-hidden">
        <div className="container-main text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
              <Sun className="w-4 h-4" /> Free Quote Request
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
              Get Your Free Solar Quote
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-300 max-w-lg mx-auto">
              Fill in your details and our team will get back to you with a customized solar proposal.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="section bg-gray-50">
        <div className="container-main max-w-2xl">
          <div className="card p-8">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
              <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-bold text-navy-900 font-heading">Quote Request Form</h2>
                <p className="text-sm text-gray-500">All fields marked with * are required</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="full_name" className="form-label">Full Name *</label>
                  <input id="full_name" name="full_name" type="text" required className="form-input" placeholder="Muhammad Ahmed" value={form.full_name} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="phone" className="form-label">Phone Number *</label>
                  <input id="phone" name="phone" type="tel" required className="form-input" placeholder="+92 300 0000000" value={form.phone} onChange={handleChange} />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="form-label">Email Address</label>
                  <input id="email" name="email" type="email" className="form-input" placeholder="ahmed@example.com" value={form.email} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="city" className="form-label">City</label>
                  <select id="city" name="city" className="form-select" value={form.city} onChange={handleChange}>
                    <option value="Lahore">Lahore</option>
                    <option value="Sheikhupura">Sheikhupura</option>
                    <option value="Gujranwala">Gujranwala</option>
                    <option value="Kasur">Kasur</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="property_type" className="form-label">Property Type</label>
                  <select id="property_type" name="property_type" className="form-select" value={form.property_type} onChange={handleChange}>
                    <option value="residential">Residential (Home)</option>
                    <option value="commercial">Commercial (Business)</option>
                    <option value="industrial">Industrial (Factory)</option>
                    <option value="agricultural">Agricultural (Farm)</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="preferred_system" className="form-label">Preferred System</label>
                  <select id="preferred_system" name="preferred_system" className="form-select" value={form.preferred_system} onChange={handleChange}>
                    <option value="hybrid">Hybrid Solar System</option>
                    <option value="on_grid">On-Grid Solar System</option>
                    <option value="off_grid">Off-Grid Solar System</option>
                    <option value="ups">UPS / Battery Backup</option>
                    <option value="not_sure">Not Sure — Need Advice</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="monthly_bill" className="form-label">Monthly Electricity Bill (PKR)</label>
                  <input id="monthly_bill" name="monthly_bill" type="number" min="0" className="form-input" placeholder="e.g. 8000" value={form.monthly_bill} onChange={handleChange} />
                </div>
                <div>
                  <label htmlFor="monthly_units" className="form-label">Monthly Units (kWh)</label>
                  <input id="monthly_units" name="monthly_units" type="number" min="0" className="form-input" placeholder="e.g. 400" value={form.monthly_units} onChange={handleChange} />
                </div>
              </div>

              <div>
                <label htmlFor="roof_size" className="form-label">Roof / Space Size (sqft) — Optional</label>
                <input id="roof_size" name="roof_size" type="number" min="0" className="form-input" placeholder="e.g. 1000" value={form.roof_size} onChange={handleChange} />
              </div>

              <div>
                <label htmlFor="message" className="form-label">Additional Message — Optional</label>
                <textarea id="message" name="message" rows={4} className="form-input resize-none" placeholder="Any specific requirements, questions, or details you'd like to share..." value={form.message} onChange={handleChange} />
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </span>
                ) : "Submit Quote Request"}
              </button>

              <p className="text-xs text-gray-400 text-center">
                We will contact you within 24 hours. Your information is kept private and never shared.
              </p>
            </form>
          </div>
        </div>
      </section>
    </>
  );
}
