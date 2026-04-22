"use client";

import { motion } from "framer-motion";

const roles = [
  {
    title: "Senior VFX Artist",
    type: "Full Time",
    location: "Kuwait",
    description:
      "Lead high-end visual effects productions for regional and international brands. Deep expertise in compositing, CGI integration, and motion design required.",
  },
  {
    title: "Social Media Manager",
    type: "Full Time",
    location: "Kuwait",
    description:
      "Own content strategy and community management for Astroshot clients across Instagram, TikTok, and YouTube. Data-driven with a creative edge.",
  },
  {
    title: "Motion Graphics Designer",
    type: "Full Time",
    location: "Kuwait",
    description:
      "Craft compelling motion graphics and animations for brand campaigns, social content, and broadcast. Proficiency in After Effects and Cinema 4D essential.",
  },
];

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-20"
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            Careers
          </span>
          <h1 className="mt-3 text-5xl lg:text-6xl font-black text-[#111111] tracking-tight leading-tight">
            Join the Team
          </h1>
          <p className="mt-5 text-[#666666] text-base max-w-lg leading-relaxed">
            We are always looking for exceptional creative minds in Kuwait. If you make things that stop the scroll, you belong here.
          </p>
        </motion.div>

        {/* Openings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-[#999999] mb-8">
            Current Openings
          </h2>
          <div className="space-y-5">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="bg-white rounded-2xl border border-[#f0f0f0] p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-black text-[#111111]">{role.title}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#01F17C]/10 text-[#01F17C]">
                      {role.type}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#f0f0f0] text-[#666666]">
                      {role.location}
                    </span>
                  </div>
                  <p className="text-[#666666] text-sm leading-relaxed">{role.description}</p>
                </div>
                <a
                  href={`mailto:info@astroshotpm.com?subject=Application: ${encodeURIComponent(role.title)}`}
                  className="shrink-0 self-start sm:self-center px-6 py-3 rounded-xl bg-[#111111] text-white text-sm font-bold hover:bg-[#01F17C] hover:text-[#050505] transition-colors whitespace-nowrap"
                >
                  Apply Now →
                </a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Open application */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 p-8 rounded-2xl bg-[#050505] text-center"
        >
          <p className="text-white/60 text-sm mb-2">Don&apos;t see your role?</p>
          <p className="text-white font-bold text-base mb-4">
            Send your portfolio to{" "}
            <a
              href="mailto:info@astroshotpm.com"
              className="text-[#01F17C] hover:underline"
            >
              info@astroshotpm.com
            </a>
          </p>
          <p className="text-white/40 text-xs">We review every submission.</p>
        </motion.div>
      </div>
    </div>
  );
}
