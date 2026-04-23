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
    <div className="min-h-screen bg-[#050505] pt-24">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
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
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            Join the Team
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-lg leading-relaxed">
            We are always looking for exceptional creative minds in Kuwait. If you make things that stop the scroll, you belong here.
          </p>
        </motion.div>

        {/* Openings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="text-xs font-bold uppercase tracking-[0.25em] text-white/50 mb-8">
            Current Openings
          </h2>
          <div className="space-y-5">
            {roles.map((role, i) => (
              <motion.div
                key={role.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + i * 0.1 }}
                className="bg-[#0d0d0d] rounded-2xl border border-white/10 p-8 flex flex-col sm:flex-row sm:items-start justify-between gap-6 hover:border-[#01F17C]/30 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <h3 className="text-xl font-extrabold text-white">{role.title}</h3>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#01F17C]/15 border border-[#01F17C]/30 text-[#01F17C]">
                      {role.type}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/70">
                      {role.location}
                    </span>
                  </div>
                  <p className="text-white/65 text-sm leading-relaxed">{role.description}</p>
                </div>
                <a
                  href={`mailto:info@astroshotpm.com?subject=Application: ${encodeURIComponent(role.title)}`}
                  className="shrink-0 self-start sm:self-center px-6 py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] transition-colors whitespace-nowrap"
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
          className="mt-16 p-10 rounded-2xl bg-gradient-to-br from-[#0d0d0d] to-[#050505] border border-white/10 text-center"
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
