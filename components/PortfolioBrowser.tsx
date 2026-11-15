"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import ProjectCard from "@/components/ProjectCard";
import type { Project } from "@/lib/supabase";

const categories = [
  "All",
  "Mixed Reality",
  "Full CGI",
  "Cinema AI",
  "Social Media Content",
  "Motion Graphics",
] as const;

type Category = (typeof categories)[number];

const servicePathways = [
  { label: "CGI Campaigns", href: "/cgi-agency-kuwait" },
  { label: "VFX Campaigns", href: "/vfx-agency-kuwait" },
  { label: "Social Media", href: "/social-media-agency-kuwait" },
  { label: "Automotive", href: "/automotive-marketing-kuwait" },
  { label: "Launch Content", href: "/content-creation-kuwait" },
  { label: "Seasonal Campaigns", href: "/ramadan-campaign-kuwait" },
];

export default function PortfolioBrowser({
  projects,
  projectProofs,
}: {
  projects: Project[];
  projectProofs: Record<string, string>;
}) {
  const [active, setActive] = useState<Category>("All");
  const filtered =
    active === "All" ? projects : projects.filter((project) => project.category === active);
  const proofStats = [
    { value: "80M+", label: "Jahez campaign views" },
    { value: "51M+", label: "Honda launch views" },
    { value: "15.8M", label: "NGUE organic views" },
    { value: "2.5M+", label: "Huawei launch views" },
  ];

  return (
    <>
      <div className="mb-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 lg:grid-cols-4">
        {proofStats.map((stat) => (
          <div key={stat.label} className="bg-[#080808] p-5">
            <p className="text-3xl font-black tracking-tight text-white">{stat.value}</p>
            <p className="mt-2 text-xs font-bold uppercase tracking-widest text-white/60">
              {stat.label}
            </p>
          </div>
        ))}
      </div>

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

      <div className="mb-10 rounded-2xl border border-white/10 bg-[#080808] p-5">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-white/60">
          Explore by need
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          {servicePathways.map((pathway) => (
            <Link
              key={pathway.href}
              href={pathway.href}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/60 transition-colors hover:border-[#01F17C]/60 hover:text-[#01F17C]"
            >
              {pathway.label}
            </Link>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl text-[#01F17C]">+</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            {active === "All" ? "Projects coming soon" : `No ${active} projects yet`}
          </h3>
          <p className="text-white/50 text-sm">
            We&apos;re uploading our portfolio. Check back soon.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5"
        >
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </motion.div>
      )}
    </>
  );
}
