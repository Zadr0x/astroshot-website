"use client";

import { motion } from "framer-motion";

const testimonials = [
  {
    quote:
      "Well done team. Very happy with the outcome and how good they are performing so far.",
    client: "Mercedes",
    role: "Marketing Director",
  },
  {
    quote:
      "We all loved the video. It's very creative and suits the car perfectly.",
    client: "BMW",
    role: "Marketing Manager",
  },
  {
    quote:
      "Grateful to have incredible partners like Astroshot who bring these ideas to life and always have our back.",
    client: "Gulf Bank",
    role: "CMO",
  },
  {
    quote:
      "Amazing, thank you for the fast execution on such short notice — great work guys!",
    client: "Huawei",
    role: "Marketing Manager",
  },
  {
    quote: "Thank you guys, it's going on fire on TikTok.",
    client: "BYD",
    role: "Marketing Manager",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="relative py-24 lg:py-32 bg-[#050505] overflow-hidden">
      {/* Subtle atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at top, rgba(1,241,124,0.08), transparent 60%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            Client Voices
          </span>
          <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            What Our Clients Say
          </h2>
          <p className="mt-4 text-white/60 max-w-lg mx-auto text-base">
            Real words from the teams we&apos;ve worked with across Kuwait
            and the GCC.
          </p>
        </motion.div>

        {/* Featured (large) */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative mb-8 rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-[#0f0f0f] to-[#050505] p-10 lg:p-14"
        >
          <div
            className="absolute -top-20 -left-20 w-80 h-80 pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(1,241,124,0.18), transparent 70%)",
            }}
          />
          <div className="relative">
            <span className="text-[#01F17C] text-6xl font-serif leading-none block mb-4">
              &ldquo;
            </span>
            <p className="text-2xl lg:text-3xl font-light text-white leading-relaxed max-w-4xl">
              {testimonials[2].quote}
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-px bg-[#01F17C]" />
              <div>
                <p className="text-white font-bold text-base">
                  {testimonials[2].client}
                </p>
                <p className="text-white/50 text-sm">
                  {testimonials[2].role}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grid of the rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {testimonials
            .filter((_, i) => i !== 2)
            .map((t, i) => (
              <motion.div
                key={t.client}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group relative rounded-2xl border border-white/10 bg-[#0d0d0d] p-7 hover:border-[#01F17C]/40 transition-all duration-300 flex flex-col"
              >
                <span className="text-[#01F17C] text-4xl font-serif leading-none mb-4">
                  &ldquo;
                </span>
                <p className="text-white/80 text-sm leading-relaxed flex-1">
                  {t.quote}
                </p>
                <div className="mt-6 pt-5 border-t border-white/10">
                  <p className="text-white font-bold text-sm">{t.client}</p>
                  <p className="text-white/50 text-xs mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
}
