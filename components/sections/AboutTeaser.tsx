"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutTeaser() {
  return (
    <section className="py-24 lg:py-32 bg-[#FAFAFA]">
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
            <span className="text-xs font-700 uppercase tracking-[0.25em] text-[#00a855]">
              About Us
            </span>
            <h2 className="mt-4 text-3xl lg:text-4xl font-800 text-[#111111] leading-tight">
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
            <p className="text-[#666666] text-base leading-relaxed mb-6">
              Founded with one goal — to put Gulf brands on the global map.
              We&apos;ve spent 8+ years perfecting the craft of visual
              storytelling, generating over 500 million organic views for our
              clients across Kuwait, Saudi Arabia, and the wider GCC.
            </p>
            <p className="text-[#666666] text-base leading-relaxed mb-8">
              From Fortune 500 automotive campaigns to local F&B brands
              breaking records — we approach every project with the same
              obsessive attention to quality.
            </p>
            <Link
              href="/about"
              className="inline-flex items-center gap-2 text-sm font-700 text-[#111111] hover:text-[#01F17C] transition-colors"
            >
              Our Story →
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
