"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  VFX: "bg-[#01F17C]/10 text-[#01F17C]",
  "Social Media": "bg-blue-500/10 text-blue-400",
  Branding: "bg-purple-500/10 text-purple-400",
  "3D Animation": "bg-orange-500/10 text-orange-400",
};

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = project.media_type === "video" && !!project.media_url;

  useEffect(() => {
    if (!videoRef.current) return;
    if (hovered) {
      videoRef.current.play().catch(() => {});
    } else {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, [hovered]);

  return (
    <motion.div
      className="group relative rounded-2xl overflow-hidden bg-[#111111] aspect-video cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4 }}
    >
      {/* Thumbnail */}
      {project.thumbnail_url ? (
        <Image
          src={project.thumbnail_url}
          alt={project.title}
          fill
          className={`object-cover transition-all duration-500 ${
            hovered && isVideo ? "opacity-0 scale-105" : "opacity-100 scale-100"
          }`}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#36FF9D]/20 via-[#01F17C]/10 to-[#050505]" />
      )}

      {/* Video — always mounted for video projects, shown/hidden via opacity */}
      {isVideo && (
        <video
          ref={videoRef}
          src={project.media_url!}
          muted
          loop
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
            hovered ? "opacity-100" : "opacity-0"
          }`}
        />
      )}

      {/* Play button overlay — visible on non-hovered video cards */}
      {isVideo && !hovered && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent transition-opacity duration-300 ${
          hovered ? "opacity-100" : "opacity-60"
        }`}
      />

      {/* Content */}
      <div className="absolute bottom-0 left-0 right-0 p-5">
        <span
          className={`inline-block text-xs font-600 px-2.5 py-1 rounded-full mb-2 ${
            categoryColors[project.category] || "bg-white/10 text-white"
          }`}
        >
          {project.category}
        </span>
        <h3 className="text-white font-700 text-base leading-snug">
          {project.title}
        </h3>
        {project.description && hovered && (
          <p className="text-white/60 text-xs mt-1 line-clamp-2">
            {project.description}
          </p>
        )}
      </div>

      {project.featured && (
        <div className="absolute top-3 right-3 bg-[#01F17C] text-[#050505] text-xs font-700 px-2 py-0.5 rounded-full">
          Featured
        </div>
      )}
    </motion.div>
  );
}
