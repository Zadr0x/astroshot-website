"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";

const gradients = [
  "from-[#01F17C]/20 via-[#050505] to-[#111111]",
  "from-purple-500/20 via-[#050505] to-[#111111]",
  "from-blue-500/20 via-[#050505] to-[#111111]",
  "from-orange-500/20 via-[#050505] to-[#111111]",
  "from-pink-500/20 via-[#050505] to-[#111111]",
  "from-cyan-500/20 via-[#050505] to-[#111111]",
];

const placeholderLabels = ["VFX", "Branding", "3D Animation", "Social Media", "CGI", "Motion"];

export default function PortfolioPreview() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("sort_order", { ascending: true })
      .limit(6)
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, []);

  const placeholderCount = Math.max(0, 6 - projects.length);

  return (
    <section className="py-16 lg:py-20 bg-[#FAFAFA]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="text-xs font-700 uppercase tracking-[0.25em] text-[#00a855]">
              Portfolio
            </span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-800 text-[#111111] tracking-tight">
              Our Work
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="self-start sm:self-auto px-6 py-3 text-sm font-700 rounded-xl border-2 border-[#111111] text-[#111111] hover:bg-[#111111] hover:text-white transition-all duration-300"
          >
            View All Projects →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {/* Real projects */}
          {!loading && projects.map((project, i) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
            >
              <ProjectCard project={project} />
            </motion.div>
          ))}

          {/* Placeholder cards to fill remaining slots */}
          {Array.from({ length: loading ? 6 : placeholderCount }).map((_, i) => {
            const gradientIndex = loading ? i : projects.length + i;
            return (
              <motion.div
                key={`placeholder-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: (loading ? i : projects.length + i) * 0.08 }}
                className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${gradients[gradientIndex % 6]} aspect-[4/5] flex items-center justify-center border border-white/5 ${loading ? "animate-pulse" : ""}`}
              >
                {!loading && (
                  <div className="text-center p-6">
                    <div className="w-10 h-10 rounded-full border border-[#01F17C]/30 flex items-center justify-center mx-auto mb-3">
                      <span className="text-[#01F17C] text-lg">✦</span>
                    </div>
                    <p className="text-white/40 text-xs font-600 uppercase tracking-widest">
                      {placeholderLabels[(projects.length + i) % 6]}
                    </p>
                    <p className="text-white/20 text-xs mt-1">Coming soon</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
