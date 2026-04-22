"use client";
import { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/supabase";

const categoryColors: Record<string, string> = {
  VFX: "bg-[#01F17C]/10 text-[#01F17C]",
  "Social Media": "bg-blue-500/10 text-blue-400",
  Branding: "bg-purple-500/10 text-purple-400",
  "3D Animation": "bg-orange-500/10 text-orange-400",
};

export default function ProjectCard({ project }: { project: Project }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = useState(false);
  const isVideo = project.media_type === "video" && !!project.media_url;

  return (
    <Link href={`/portfolio/${project.id}`} className="block group">
      <div
        className="relative rounded-2xl overflow-hidden bg-[#111111] aspect-[4/5] cursor-pointer"
        onMouseEnter={() => {
          setHovered(true);
          videoRef.current?.play().catch(() => {});
        }}
        onMouseLeave={() => {
          setHovered(false);
          if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
          }
        }}
      >
        {/* Dark gradient placeholder bg */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#222] to-[#111]" />

        {/* Thumbnail */}
        {project.thumbnail_url && (
          <Image
            src={project.thumbnail_url}
            alt={project.title}
            fill
            className={`object-cover transition-opacity duration-300 ${hovered && isVideo ? "opacity-0" : "opacity-100"}`}
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        )}

        {/* Video — always in DOM, hidden until ready AND hovered */}
        {isVideo && project.media_url && (
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="auto"
            onCanPlay={(e) => { (e.target as HTMLVideoElement).dataset.ready = "1"; }}
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
          >
            <source src={project.media_url} type="video/mp4" />
          </video>
        )}

        {/* Play icon — only when not hovered AND is video */}
        {isVideo && !hovered && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-10 h-10 rounded-full bg-black/60 flex items-center justify-center">
              <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}

        {/* Gradient overlay bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-2 ${categoryColors[project.category] || "bg-white/10 text-white"}`}>
            {project.category}
          </span>
          <h3 className="text-white font-bold text-sm leading-snug">{project.title}</h3>
        </div>

        {project.featured && (
          <div className="absolute top-3 right-3 bg-[#01F17C] text-[#050505] text-xs font-bold px-2 py-0.5 rounded-full">Featured</div>
        )}
      </div>
    </Link>
  );
}
