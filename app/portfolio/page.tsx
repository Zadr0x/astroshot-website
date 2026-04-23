"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/supabase";
import ProjectCard from "@/components/ProjectCard";
import { motion } from "framer-motion";

const categories = ["All", "Mixed Reality", "Full CGI", "Cinema AI", "Social Media Content", "Motion Graphics", "Branding"] as const;
type Category = (typeof categories)[number];

export default function PortfolioPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<Category>("All");

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "published")
        .order("sort_order", { ascending: true });
      setProjects(data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const filtered =
    active === "All" ? projects : projects.filter((p) => p.category === active);

  return (
    <div className="min-h-screen bg-[#050505] pt-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        {/* Header */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            Portfolio
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
            Our Work
          </h1>
          <p className="mt-4 text-white/60 text-base max-w-md">
            500M+ organic views generated for brands across Kuwait and the GCC.
          </p>
        </motion.div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-200 border ${
                active === cat
                  ? "bg-[#01F17C] text-[#050505] border-[#01F17C]"
                  : "bg-white/5 text-white/70 border-white/10 hover:border-white/25 hover:text-white"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded-2xl bg-[#111] aspect-[4/5] animate-pulse"
              />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-[#01F17C]">✦</span>
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {active === "All" ? "Projects coming soon" : `No ${active} projects yet`}
            </h3>
            <p className="text-white/50 text-sm">
              We&apos;re uploading our portfolio — check back soon.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {filtered.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
