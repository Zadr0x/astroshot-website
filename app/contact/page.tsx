"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";

const services = [
  "VFX & CGI",
  "Social Media",
  "Branding",
  "3D Animation",
  "Multiple Services",
  "Not Sure Yet",
];

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    company: "",
    email: "",
    phone: "",
    service: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const { error: err } = await supabase.from("contact_submissions").insert({
      name: formData.name,
      company: formData.company || null,
      email: formData.email || null,
      phone: formData.phone || null,
      service: formData.service || null,
      message: formData.message,
      status: "new",
    });

    if (err) {
      setError("Something went wrong. Please email us directly at info@astroshotpm.com");
      setSubmitting(false);
      return;
    }

    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Left info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
              Contact
            </span>
            <h1 className="mt-3 text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-tight">
              Let&apos;s Build Something Extraordinary
            </h1>
            <p className="mt-6 text-[#666666] text-base leading-relaxed max-w-md">
              Ready to make your brand impossible to ignore? Drop us a message
              and we&apos;ll come back to you within one business day.
            </p>

            <div className="mt-12 space-y-6">
              {[
                { label: "Email", value: "info@astroshotpm.com", href: "mailto:info@astroshotpm.com" },
                { label: "Phone", value: "+965 9333 6065", href: "tel:+96593336065" },
                { label: "Instagram", value: "@astroshotmedia", href: "https://instagram.com/astroshotmedia" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#999999] mb-1">
                    {item.label}
                  </p>
                  <a
                    href={item.href}
                    target={item.href.startsWith("http") ? "_blank" : undefined}
                    rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    className="text-[#111111] font-semibold hover:text-[#01F17C] transition-colors"
                  >
                    {item.value}
                  </a>
                </div>
              ))}
            </div>

            <div className="mt-10 p-6 rounded-2xl bg-[#050505] text-white">
              <p className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-2">
                Office
              </p>
              <p className="text-sm text-white/70 leading-relaxed">
                Qibla Block 13, Fahad Al Salem Street
                <br />
                Al Salam Tower, 16th Floor, Office 7
                <br />
                Kuwait City, Kuwait
              </p>
            </div>
          </motion.div>

          {/* Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {submitted ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-[#01F17C]/10 flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#01F17C] text-2xl">✓</span>
                  </div>
                  <h2 className="text-2xl font-black text-[#111111] mb-2">
                    Message Sent!
                  </h2>
                  <p className="text-[#666666] text-sm">
                    We&apos;ll be in touch within one business day.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-2xl bg-white border border-[#f0f0f0] p-8 lg:p-10 space-y-6"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                      Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] text-sm text-[#111111] placeholder:text-[#cccccc] focus:outline-none focus:border-[#01F17C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your company"
                      className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] text-sm text-[#111111] placeholder:text-[#cccccc] focus:outline-none focus:border-[#01F17C] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] text-sm text-[#111111] placeholder:text-[#cccccc] focus:outline-none focus:border-[#01F17C] transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+965 XXXX XXXX"
                      className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] text-sm text-[#111111] placeholder:text-[#cccccc] focus:outline-none focus:border-[#01F17C] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                    Service *
                  </label>
                  <select
                    name="service"
                    required
                    value={formData.service}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] text-sm text-[#111111] focus:outline-none focus:border-[#01F17C] transition-colors bg-white appearance-none"
                  >
                    <option value="">Select a service</option>
                    {services.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-widest text-[#999999] mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    required
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Tell us about your project..."
                    className="w-full px-4 py-3 rounded-xl border border-[#e8e8e8] text-sm text-[#111111] placeholder:text-[#cccccc] focus:outline-none focus:border-[#01F17C] transition-colors resize-none"
                  />
                </div>

                {error && <p className="text-red-500 text-sm">{error}</p>}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 text-sm font-bold rounded-xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] disabled:opacity-60 transition-colors"
                >
                  {submitting ? "Sending..." : "Send Message →"}
                </button>

                <p className="text-xs text-[#999999] text-center">
                  Or email us directly at{" "}
                  <a href="mailto:info@astroshotpm.com" className="text-[#01F17C] hover:underline">
                    info@astroshotpm.com
                  </a>
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
