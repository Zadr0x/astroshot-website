"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { Project, ProjectImage } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  VFX: "bg-[#01F17C]/10 text-[#01F17C]",
  "Social Media": "bg-blue-500/10 text-blue-500",
  Branding: "bg-purple-500/10 text-purple-600",
  "3D Animation": "bg-orange-500/10 text-orange-500",
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [images, setImages] = useState<ProjectImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from("projects").select("*").eq("id", id).eq("status", "published").single(),
      supabase.from("project_images").select("*").eq("project_id", id).order("sort_order"),
    ]).then(([{ data: p }, { data: imgs }]) => {
      setProject(p as Project);
      setImages((imgs as ProjectImage[]) ?? []);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24">
        <div className="max-w-5xl mx-auto px-6 py-16 space-y-6">
          <div className="h-72 rounded-2xl bg-[#f0f0f0] animate-pulse" />
          <div className="h-8 w-64 bg-[#f0f0f0] rounded animate-pulse" />
          <div className="h-24 bg-[#f0f0f0] rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-[#FAFAFA] pt-24 flex items-center justify-center">
        <div className="text-center">
          <p className="text-6xl font-black text-[#f0f0f0]">404</p>
          <p className="text-[#999] mt-2">Project not found.</p>
          <Link href="/portfolio" className="mt-6 inline-block text-sm text-[#01F17C] hover:underline">← Back to Portfolio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white text-2xl hover:text-[#01F17C]">×</button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 lg:px-8 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <Link href="/portfolio" className="text-xs font-bold uppercase tracking-widest text-[#01F17C] hover:underline">
            ← All Projects
          </Link>

          {/* Hero image */}
          {project.thumbnail_url && (
            <div className="mt-6 rounded-2xl overflow-hidden">
              <img
                src={project.thumbnail_url}
                alt={project.title}
                className="w-full h-72 lg:h-[480px] object-cover"
              />
            </div>
          )}

          {/* Title & meta */}
          <div className="mt-8 flex flex-wrap items-start gap-4">
            <div className="flex-1">
              <h1 className="text-4xl lg:text-5xl font-black text-[#111111] tracking-tight leading-tight">
                {project.title}
              </h1>
            </div>
            <span className={`mt-2 text-sm font-bold px-3 py-1.5 rounded-full shrink-0 ${categoryColors[project.category] ?? "bg-gray-100 text-gray-600"}`}>
              {project.category}
            </span>
          </div>

          {/* Description */}
          {project.description && (
            <div className="mt-8 prose max-w-none">
              <p className="text-[#444] leading-relaxed text-lg whitespace-pre-wrap">{project.description}</p>
            </div>
          )}

          {/* Main media */}
          {project.media_url && (
            <div className="mt-10">
              {project.media_type === "video" ? (
                <video
                  src={project.media_url}
                  controls
                  className="w-full rounded-2xl"
                  poster={project.thumbnail_url ?? undefined}
                />
              ) : (
                <img
                  src={project.media_url}
                  alt={project.title}
                  className="w-full rounded-2xl cursor-pointer hover:opacity-95 transition-opacity"
                  onClick={() => setLightbox(project.media_url!)}
                />
              )}
            </div>
          )}

          {/* Gallery */}
          {images.length > 0 && (
            <div className="mt-12">
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#999] mb-6">Project Gallery</h2>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {images.map((img) => (
                  <motion.div
                    key={img.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="rounded-xl overflow-hidden cursor-pointer group"
                    onClick={() => setLightbox(img.image_url)}
                  >
                    <img
                      src={img.image_url}
                      alt={img.caption ?? ""}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {img.caption && (
                      <p className="text-xs text-[#999] mt-1 px-1">{img.caption}</p>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-16 pt-8 border-t border-[#f0f0f0] flex items-center justify-between">
            <Link href="/portfolio" className="text-sm font-bold text-[#111] hover:text-[#01F17C] transition-colors">
              ← All Projects
            </Link>
            <Link
              href="/contact"
              className="px-6 py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] transition-colors"
            >
              Start a Project →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
