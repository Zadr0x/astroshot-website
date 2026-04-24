"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";

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

  if (!loading && projects.length === 0) {
    return null;
  }

  return (
    <section className="py-24 lg:py-32 bg-[#050505]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <motion.div
          className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div>
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
              Projects
            </span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
              Our Work
            </h2>
            <p className="mt-4 text-white/60 text-base max-w-2xl leading-relaxed">
              Explore a selection of Astroshot campaigns across VFX, CGI, social media, branding, and content production for brands in Kuwait and across the GCC.
            </p>
          </div>
          <Link
            href="/portfolio"
            className="self-start sm:self-auto px-6 py-3 text-sm font-bold rounded-xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-all duration-300"
          >
            View All Projects →
          </Link>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={`loading-${i}`}
                  className="rounded-2xl bg-[#111] aspect-[4/5] animate-pulse"
                />
              ))
            : projects.map((project, i) => (
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
        </div>
      </div>
    </section>
  );
}
