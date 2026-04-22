"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const isVideo = project.media_type === "video" && !!project.media_url;
  const clientName = (project as unknown as Record<string, unknown>).client_name as string | undefined;

  return (
    <Link href={`/portfolio/${project.id}`} className="block">
      <motion.div
        className="group relative rounded-2xl overflow-hidden bg-[#111111] aspect-[4/5] cursor-pointer"
        onMouseEnter={() => {
          videoRef.current?.play();
        }}
        onMouseLeave={() => {
          videoRef.current?.pause();
          if (videoRef.current) videoRef.current.currentTime = 0;
        }}
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
            className="object-cover transition-all duration-500 group-hover:[&:not(:has(~video[data-playing]))]:scale-105"
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
            preload="metadata"
            onMouseEnter={() => videoRef.current?.play()}
            className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          />
        )}

        {/* Play button overlay */}
        {isVideo && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:opacity-0 transition-opacity duration-300">
            <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/90 via-[#050505]/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-300" />

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
          {clientName && (
            <p className="text-white/50 text-xs mt-1 font-500">
              {clientName} × Astroshot
            </p>
          )}
          {project.description && (
            <p className="text-white/60 text-xs mt-1 line-clamp-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
    </Link>
  );
}
