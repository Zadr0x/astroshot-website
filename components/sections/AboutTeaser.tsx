"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="pl-6 border-l-4 border-[#01F17C]"
          >
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
              About Us
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-extrabold text-white leading-tight">
              Astroshot is Kuwait&apos;s most ambitious creative agency.
            </h2>
          </motion.div>

          {/* Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <p className="text-white/70 text-base leading-relaxed mb-6">
              Astroshot is a premium creative agency based in Kuwait, known for blending strategy, visual storytelling, VFX, CGI, and content production into campaigns that audiences actually notice.
            </p>
            <p className="text-white/70 text-base leading-relaxed mb-8">
              From Fortune 500 automotive campaigns to local F&B brands breaking records, we bring the same obsessive attention to strategy, execution, and creative impact across Kuwait, Saudi Arabia, and the wider GCC.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-bold text-white hover:text-[#01F17C] transition-colors"
              >
                Our Story →
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-bold text-[#01F17C] hover:text-white transition-colors"
              >
                Start a Project →
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
