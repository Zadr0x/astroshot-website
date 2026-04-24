"use client";

import { motion } from "framer-motion";

export default function CTABanner() {
  return (
    <section className="py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl lg:text-6xl font-800 text-white leading-tight tracking-tight">
            Ready to make your brand{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #36FF9D, #01F17C)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              impossible to ignore?
            </span>
          </h2>
          <p className="mt-6 text-[#666666] text-base max-w-2xl mx-auto leading-relaxed">
            Ready to launch your next campaign with Astroshot? Join 170+ brands across Kuwait and the GCC who trust us for VFX, CGI, social media, branding, and creative campaigns that drive attention.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="px-8 py-4 text-sm font-700 rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
            >
              Start Your Project
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=96593336065&text=Hi+Astroshot%2C+I%27d+like+to+discuss+a+project&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-4 text-sm font-700 rounded-2xl border border-white/20 text-white hover:border-white/40 transition-colors"
            >
              WhatsApp Us
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
