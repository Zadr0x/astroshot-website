"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectImage } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  VFX: "text-[#01F17C] border-[#01F17C]/30 bg-[#01F17C]/10",
  "Social Media": "text-blue-400 border-blue-400/30 bg-blue-400/10",
  Branding: "text-purple-400 border-purple-400/30 bg-purple-400/10",
  "3D Animation": "text-orange-400 border-orange-400/30 bg-orange-400/10",
  "Mixed Reality": "text-cyan-400 border-cyan-400/30 bg-cyan-400/10",
  "Full CGI": "text-[#01F17C] border-[#01F17C]/30 bg-[#01F17C]/10",
  "Cinema AI": "text-pink-400 border-pink-400/30 bg-pink-400/10",
  "Motion Graphics": "text-yellow-400 border-yellow-400/30 bg-yellow-400/10",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("*").eq("id", id).single(),
      supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
    ]).then(([{ data: p }, { data: imgs }]) => {
      setProject(p as Project);
      setImages((imgs as ProjectImage[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  // Autoplay hero video when loaded
  useEffect(() => {
    if (project?.media_type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [project]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505]">
        <div className="h-[70vh] bg-[#111] animate-pulse" />
        <div className="max-w-4xl mx-auto px-6 py-16 space-y-4">
          <div className="h-10 w-2/3 bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-4 w-full bg-[#1a1a1a] rounded animate-pulse" />
          <div className="h-4 w-3/4 bg-[#1a1a1a] rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#050505] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-black text-[#1a1a1a]">404</p>
          <p className="text-[#555] mt-2">Project not found.</p>
          <Link href="/portfolio" className="mt-6 inline-block text-sm text-[#01F17C] hover:underline">← Back to Portfolio</Link>
        </div>
      </div>
    );
  }

  const isVideo = project.media_type === "video" && !!project.media_url;

  return (
    <div className="min-h-screen bg-[#050505]">
      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-[#01F17C] transition-colors">×</button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      {/* HERO — Full viewport video or image */}
      <div className="relative w-full h-screen overflow-hidden">
        {isVideo ? (
          <video
            ref={videoRef}
            src={project.media_url!}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="w-full h-full object-cover"
          />
        ) : project.thumbnail_url ? (
          <img src={project.thumbnail_url} alt={project.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
        )}
        {/* Dark overlay at bottom for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

        {/* Back button */}
        <div className="absolute top-20 left-6 lg:left-12 z-10">
          <Link href="/portfolio" className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors">
            ← All Projects
          </Link>
        </div>

        {/* Hero content overlay */}
        <div className="absolute bottom-12 left-6 lg:left-12 right-6 lg:right-12 z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className={`text-xs font-bold px-3 py-1 rounded-full border ${categoryColors[project.category] ?? "text-white border-white/20 bg-white/10"}`}>
                {project.category}
              </span>
              {project.featured && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#01F17C] text-[#050505]">Featured</span>
              )}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
              {project.title}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-16"
        >
          {/* Description */}
          {project.description && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-4">About This Project</h2>
              <p className="text-[#aaaaaa] leading-relaxed text-lg whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Tags / metadata */}
          <div className="flex flex-wrap gap-3">
            <span className={`text-sm font-semibold px-4 py-2 rounded-full border ${categoryColors[project.category] ?? "text-white border-white/20 bg-white/10"}`}>
              {project.category}
            </span>
            <span className="text-sm font-semibold px-4 py-2 rounded-full border border-white/10 text-white/50">
              Astroshot Production
            </span>
            <span className="text-sm font-semibold px-4 py-2 rounded-full border border-white/10 text-white/50">
              Kuwait & GCC
            </span>
          </div>

          {/* Main vertical video */}
          {isVideo && project.media_url && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-6">The Film</h2>
              <div className="flex justify-center">
                <video
                  src={project.media_url}
                  controls
                  preload="auto"
                  poster={project.thumbnail_url ?? undefined}
                  className="w-full max-w-sm rounded-2xl bg-[#111]"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </div>
          )}

          {/* Gallery */}
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-6">
              {images.length > 0 ? "Gallery" : ""}
            </h2>
            {images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-2xl overflow-hidden cursor-pointer group aspect-[4/5] bg-[#111]"
                    onClick={() => setLightbox(img.image_url)}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption ?? ""}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              // Only show WIP if there is no main video either (truly empty project)
              !isVideo && (
                <div className="rounded-2xl border border-white/10 bg-[#111] p-12 text-center">
                  <p className="text-[#444] text-sm font-semibold uppercase tracking-widest">Work in Progress</p>
                  <p className="text-[#333] text-xs mt-2">Gallery coming soon</p>
                </div>
              )
            )}
          </div>

          {/* CTA */}
          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/portfolio" className="text-sm font-bold text-white/50 hover:text-white transition-colors">
              ← All Projects
            </Link>
            <Link href="/contact" className="px-8 py-4 rounded-2xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] transition-colors">
              Start a Similar Project →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
