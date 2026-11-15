"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Project, ProjectImage } from "@/lib/supabase";
import { normalizePublicMediaUrl } from "@/lib/media-url";
import type { CaseStudyData } from "@/lib/case-study-data";

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

function sourceLinkLabel(platform: string) {
  const normalized = platform.toLowerCase();
  if (normalized.includes("instagram")) return "Click to see the video in Instagram";
  if (normalized.includes("tiktok")) return "Click to see the video in TikTok";
  return `Click to see the video on ${platform}`;
}

function renderDescription(description: string) {
  const sourceLine = /^(Instagram|TikTok):\s*(https?:\/\/\S+)/i;

  return description.split("\n").map((line, index) => {
    const match = line.match(sourceLine);

    if (match) {
      return (
        <a
          key={`${line}-${index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="my-3 inline-flex rounded-full border border-[#01F17C]/30 bg-[#01F17C]/10 px-5 py-3 text-sm font-bold text-[#01F17C] transition-colors hover:border-[#01F17C] hover:bg-[#01F17C] hover:text-[#050505]"
        >
          {sourceLinkLabel(match[1])}
        </a>
      );
    }

    if (line.trim() === "") return <br key={`break-${index}`} />;

    return (
      <span key={`${line}-${index}`}>
        {line}
        <br />
      </span>
    );
  });
}

function isVideoUrl(url: string | null) {
  if (!url) return false;
  return /\.(mp4|mov|webm)(\?|#|$)/i.test(url);
}

function getInstagramReelEmbedUrl(description: string | null) {
  const match = description?.match(/https?:\/\/(?:www\.)?instagram\.com\/reel\/([^/?#\s]+)/i);
  if (!match) return null;
  return `https://www.instagram.com/reel/${match[1]}/embed`;
}

export default function ProjectDetailClient({
  project,
  images,
  caseStudy,
}: {
  project: Project;
  images: ProjectImage[];
  caseStudy?: CaseStudyData | null;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (project.media_type === "video" && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [project.media_type]);

  const thumbnailUrl = normalizePublicMediaUrl(project.thumbnail_url);
  const mediaUrl = normalizePublicMediaUrl(project.media_url);
  const isVideo = project.media_type === "video" && !!mediaUrl;
  const heroImageUrl = !isVideo ? mediaUrl ?? thumbnailUrl : null;
  const instagramReelEmbedUrl = getInstagramReelEmbedUrl(project.description);

  return (
    <div className="min-h-screen bg-[#050505]">
      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <button className="absolute top-4 right-4 text-white text-3xl hover:text-[#01F17C] transition-colors">
            x
          </button>
          <img src={lightbox} alt="" className="max-w-full max-h-full rounded-xl object-contain" />
        </div>
      )}

      <div className="relative w-full h-screen overflow-hidden">
        {isVideo ? (
          <video
            ref={videoRef}
            src={mediaUrl}
            poster={thumbnailUrl ?? undefined}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            className="w-full h-full object-cover"
          />
        ) : heroImageUrl ? (
          <img src={heroImageUrl} alt={project.title} className="w-full h-full object-contain bg-[#050505]" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#1a1a1a] to-[#050505]" />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/40" />

        <div className="absolute top-20 left-6 lg:left-12 z-10">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm font-semibold transition-colors"
          >
            All Projects
          </Link>
        </div>

        <div className="absolute bottom-24 left-6 right-6 z-10 sm:bottom-12 lg:left-12 lg:right-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex flex-wrap gap-2 mb-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  categoryColors[project.category] ?? "text-white border-white/20 bg-white/10"
                }`}
              >
                {project.category}
              </span>
              {project.featured && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#01F17C] text-[#050505]">
                  Featured
                </span>
              )}
            </div>
            <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight leading-tight max-w-3xl">
              {project.title}
            </h1>
            {caseStudy && (
              <div className="mt-5 max-w-4xl">
                <p className="max-w-3xl text-base font-semibold leading-relaxed text-white/75 lg:text-lg">
                  {caseStudy.result}
                </p>
                <div className="mt-5 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-3">
                  {caseStudy.facts.slice(0, 3).map((fact) => (
                    <div key={fact.label} className="bg-black/45 px-4 py-3 backdrop-blur-md">
                      <p className="text-[10px] font-black uppercase tracking-widest text-white/40">
                        {fact.label}
                      </p>
                      <p className="mt-1 text-sm font-black text-white">{fact.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-16"
        >
          {caseStudy && (
            <section className="space-y-10" aria-label="Case study snapshot">
              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#01F17C]">
                  Case Study Snapshot
                </p>
                <p className="text-2xl font-black leading-tight text-white lg:text-3xl">
                  {caseStudy.result}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {caseStudy.facts.map((fact) => (
                  <div key={fact.label} className="border-l border-[#01F17C]/50 bg-white/[0.03] px-5 py-4">
                    <dt className="text-[11px] font-bold uppercase tracking-widest text-white/40">
                      {fact.label}
                    </dt>
                    <dd className="mt-2 text-base font-bold text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 sm:grid-cols-2">
                <div className="bg-[#080808] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Client</p>
                  <p className="mt-2 text-white">{caseStudy.client}</p>
                </div>
                <div className="bg-[#080808] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Industry</p>
                  <p className="mt-2 text-white">{caseStudy.industry}</p>
                </div>
                <div className="bg-[#080808] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Location</p>
                  <p className="mt-2 text-white">{caseStudy.location}</p>
                </div>
                <div className="bg-[#080808] p-5">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-white/40">Campaign Type</p>
                  <p className="mt-2 text-white">{caseStudy.campaignType}</p>
                </div>
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#01F17C]">
                  Services Used
                </p>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-semibold text-white/70"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5">
                {caseStudy.sections.map((section) => (
                  <article key={section.title} className="border-t border-white/10 pt-6">
                    <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C]">
                      {section.title}
                    </h2>
                    <p className="mt-3 text-lg leading-relaxed text-[#aaaaaa]">{section.body}</p>
                  </article>
                ))}
              </div>

              <div>
                <p className="mb-4 text-xs font-bold uppercase tracking-widest text-[#01F17C]">
                  Proof Links
                </p>
                <div className="flex flex-wrap gap-3">
                  {caseStudy.proofLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="rounded-full border border-[#01F17C]/30 bg-[#01F17C]/10 px-5 py-3 text-sm font-bold text-[#01F17C] transition-colors hover:border-[#01F17C] hover:bg-[#01F17C] hover:text-[#050505]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </section>
          )}

          {project.description && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-4">
                About This Project
              </h2>
              <div className="text-[#aaaaaa] leading-relaxed text-lg">
                {renderDescription(project.description)}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <span
              className={`text-sm font-semibold px-4 py-2 rounded-full border ${
                categoryColors[project.category] ?? "text-white border-white/20 bg-white/10"
              }`}
            >
              {project.category}
            </span>
            <span className="text-sm font-semibold px-4 py-2 rounded-full border border-white/10 text-white/50">
              Astroshot Production
            </span>
            <span className="text-sm font-semibold px-4 py-2 rounded-full border border-white/10 text-white/50">
              Kuwait & GCC
            </span>
          </div>

          {isVideo && mediaUrl && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-6">
                The Film
              </h2>
              <div className="flex justify-center">
                <video
                  src={mediaUrl}
                  controls
                  preload="metadata"
                  poster={thumbnailUrl ?? undefined}
                  className="w-full max-w-sm rounded-2xl bg-[#111]"
                  style={{ maxHeight: "80vh" }}
                />
              </div>
            </div>
          )}

          {!isVideo && instagramReelEmbedUrl && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-6">
                Launch Reel
              </h2>
              <div className="flex justify-center">
                <iframe
                  src={instagramReelEmbedUrl}
                  title={`${project.title} Instagram reel`}
                  loading="lazy"
                  className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#111]"
                  style={{ aspectRatio: "9 / 16" }}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                />
              </div>
            </div>
          )}

          {images.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-6">
                Gallery
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {images.map((img) => {
                  const itemUrl = normalizePublicMediaUrl(img.image_url);
                  const itemIsVideo = isVideoUrl(itemUrl);

                  return (
                    <motion.div
                      key={img.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="overflow-hidden rounded-2xl bg-[#111] border border-white/10"
                    >
                      <div
                        className={`aspect-[4/5] bg-[#111] ${itemIsVideo ? "" : "cursor-pointer group"}`}
                        onClick={() => {
                          if (!itemIsVideo) setLightbox(itemUrl);
                        }}
                      >
                        {itemIsVideo ? (
                          <video
                            src={itemUrl ?? ""}
                            controls
                            preload="metadata"
                            playsInline
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <img
                            src={itemUrl ?? ""}
                            alt={img.caption ?? project.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      {img.caption && (
                        <div className="border-t border-white/10 px-4 py-3 text-sm font-bold text-white/70">
                          {img.caption}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <Link href="/portfolio" className="text-sm font-bold text-white/50 hover:text-white transition-colors">
              All Projects
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 rounded-2xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] transition-colors"
            >
              Start a Similar Project
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
