"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock, MessageCircle, Send, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/lib/api";
import { getWhatsAppLink } from "@/lib/utils";

const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "923006639477";
const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", phone: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoading(true);
    try {
      await api.submitContact({
        name: form.name,
        phone: form.phone || undefined,
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      setSubmitted(true);
    } catch {
      toast.error("Could not send message. Please contact us by phone or WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-hero pt-32 pb-20 bg-dots overflow-hidden">
        <div className="container-main text-center">
          <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-600/20 border border-green-500/30 text-green-400 text-sm font-medium rounded-full mb-6">
              <Phone className="w-4 h-4" /> Contact Us
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl font-bold text-white mb-4 font-heading">
              Get In Touch
            </motion.h1>
            <motion.p variants={fadeUp} className="text-gray-300 max-w-lg mx-auto">
              Have questions about solar? We are here to help. Reach out by phone, WhatsApp, or use the form below.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section bg-gray-50">
        <div className="container-main">
          <div className="grid lg:grid-cols-5 gap-10">

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {[
                { icon: Phone, label: "Phone", value: "+92 300 6639477", href: "tel:+923006639477", color: "green" },
                { icon: Mail, label: "Email", value: "alrehmansolarspk@gmail.com", href: "mailto:alrehmansolarspk@gmail.com", color: "blue" },
                { icon: MapPin, label: "Location", value: "Eden Abad, A Block, near Khayaban-e-Amin, Edenabad, Lahore, Pakistan", href: undefined, color: "red" },
                { icon: Clock, label: "Business Hours", value: "Mon–Sat: 9:00 AM – 6:00 PM", href: undefined, color: "solar" },
              ].map(({ icon: Icon, label, value, href, color }) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="card p-5 flex gap-4 items-start"
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    color === "green" ? "bg-green-50" : color === "blue" ? "bg-blue-50" :
                    color === "red" ? "bg-red-50" : "bg-solar-50"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      color === "green" ? "text-green-600" : color === "blue" ? "text-blue-600" :
                      color === "red" ? "text-red-600" : "text-solar-600"
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-0.5">{label}</p>
                    {href ? (
                      <a href={href} className="font-medium text-navy-900 hover:text-green-600 transition-colors">{value}</a>
                    ) : (
                      <p className="font-medium text-navy-900">{value}</p>
                    )}
                  </div>
                </motion.div>
              ))}

              {/* WhatsApp CTA */}
              <motion.a
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                href={getWhatsAppLink(WHATSAPP)}
                target="_blank"
                rel="noopener noreferrer"
                id="whatsapp-cta"
                className="flex items-center gap-4 p-5 bg-[#25D366] rounded-2xl text-white hover:bg-[#20bd5a] transition-colors group"
              >
                <div className="w-11 h-11 bg-white/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Prefer WhatsApp?</p>
                  <p className="font-bold">Chat With Us on WhatsApp</p>
                </div>
              </motion.a>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="card p-8">
                {submitted ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                    <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-navy-900 mb-2 font-heading">Message Sent!</h2>
                    <p className="text-gray-600">Thank you for reaching out. We will get back to you as soon as possible.</p>
                  </motion.div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-navy-900 mb-6 font-heading">Send Us a Message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="name" className="form-label">Name *</label>
                          <input id="name" name="name" type="text" required className="form-input" placeholder="Your name" value={form.name} onChange={handleChange} />
                        </div>
                        <div>
                          <label htmlFor="phone" className="form-label">Phone</label>
                          <input id="phone" name="phone" type="tel" className="form-input" placeholder="+92 300..." value={form.phone} onChange={handleChange} />
                        </div>
                      </div>
                      <div>
                        <label htmlFor="email" className="form-label">Email *</label>
                        <input id="email" name="email" type="email" required className="form-input" placeholder="your@email.com" value={form.email} onChange={handleChange} />
                      </div>
                      <div>
                        <label htmlFor="subject" className="form-label">Subject</label>
                        <input id="subject" name="subject" type="text" className="form-input" placeholder="e.g. Solar quote for home" value={form.subject} onChange={handleChange} />
                      </div>
                      <div>
                        <label htmlFor="message" className="form-label">Message *</label>
                        <textarea id="message" name="message" rows={5} required className="form-input resize-none" placeholder="Tell us about your requirements..." value={form.message} onChange={handleChange} />
                      </div>
                      <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
                        {loading ? (
                          <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Sending...
                          </span>
                        ) : (
                          <><Send className="w-4 h-4" /> Send Message</>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
