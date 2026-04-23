"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Project } from "@/lib/supabase";

function VideoCard({ project }: { project: Project }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const card = cardRef.current;
    const video = videoRef.current;
    if (!card || !video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          video.play().catch(() => {});
        } else {
          video.pause();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(card);
    return () => observer.disconnect();
  }, []);

  return (
    <Link href={`/portfolio/${project.id}`} className="block group flex-shrink-0 w-[85vw] sm:w-[45vw] lg:w-[30vw] max-w-sm">
      <div ref={cardRef} className="relative rounded-2xl overflow-hidden bg-[#111] aspect-[4/5]">
        {project.media_url && project.media_type === "video" ? (
          <video
            ref={videoRef}
            src={project.media_url}
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#222] to-[#111]" />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-5">
          <span className="text-xs font-semibold text-[#01F17C] uppercase tracking-wider">{project.category}</span>
          <h3 className="mt-1 text-white font-bold text-base leading-snug">{project.title}</h3>
          <span className="mt-2 inline-flex items-center gap-1 text-xs text-white/60 group-hover:text-white transition-colors">
            View Project →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function FeaturedVideos() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false })
      .order("sort_order", { ascending: true })
      .limit(6)
      .then(({ data }) => setProjects(data ?? []));
  }, []);

  if (projects.length === 0) return null;

  return (
    <section className="py-16 lg:py-20 bg-[#050505] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-10">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-xs font-700 uppercase tracking-[0.25em] text-[#01F17C]">
              Selected Work
            </span>
            <h2 className="mt-3 text-4xl lg:text-5xl font-800 text-white tracking-tight">
              Latest Projects
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/20 text-white text-sm font-600 hover:border-[#01F17C] hover:text-[#01F17C] transition-all duration-300"
          >
            See All Projects →
          </Link>
        </div>
      </div>

      {/* Horizontal scroll on mobile, grid on desktop */}
      <div className="flex gap-4 px-6 lg:px-8 overflow-x-auto pb-4 lg:overflow-visible lg:grid lg:grid-cols-3 lg:max-w-7xl lg:mx-auto snap-x snap-mandatory lg:snap-none scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {projects.slice(0, 3).map((project) => (
          <div key={project.id} className="snap-start">
            <VideoCard project={project} />
          </div>
        ))}
      </div>

      <div className="text-center mt-10 sm:hidden">
        <Link
          href="/portfolio"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white text-sm font-600 hover:border-[#01F17C] hover:text-[#01F17C] transition-all duration-300"
        >
          See All Projects →
        </Link>
      </div>
    </section>
  );
}
