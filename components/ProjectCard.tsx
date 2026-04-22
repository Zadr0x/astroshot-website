"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Project } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  VFX: "bg-[#01F17C]/10 text-[#01F17C]",
  "Social Media": "bg-blue-500/10 text-blue-400",
  Branding: "bg-purple-500/10 text-purple-400",
  "3D Animation": "bg-orange-500/10 text-orange-400",
};

export default function ProjectCard({ project }: { project: Project }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = project.media_type === "video" && !!project.media_url;

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  return (
    <Link href={`/portfolio/${project.id}`}>
      <motion.div
        className="group relative rounded-2xl overflow-hidden bg-[#111111] aspect-[4/5] cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
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
            className="object-cover transition-opacity duration-500 group-hover:opacity-0"
            sizes="(max-width: 768px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#36FF9D]/20 via-[#01F17C]/10 to-[#050505]" />
        )}

        {/* Video */}
        {isVideo && (
          <video
            ref={videoRef}
            src={project.media_url!}
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
        )}

        {/* Play icon for video cards */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity pointer-events-none">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className={`inline-block text-xs font-600 px-2.5 py-1 rounded-full mb-2 ${categoryColors[project.category] || "bg-white/10 text-white"}`}>
            {project.category}
          </span>
          <h3 className="text-white font-700 text-sm leading-snug">{project.title}</h3>
        </div>

        {project.featured && (
          <div className="absolute top-3 right-3 bg-[#01F17C] text-[#050505] text-xs font-700 px-2 py-0.5 rounded-full">
            Featured
          </div>
        )}
      </motion.div>
    </Link>
  );
}
