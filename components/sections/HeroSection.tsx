"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";
import { supabase } from "@/lib/supabase";

export default function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [desktopVideoSrc, setDesktopVideoSrc] = useState("/hero-reel.mp4");
  const [mobileVideoSrc, setMobileVideoSrc] = useState("/hero-reel-mobile.mp4");

  useEffect(() => {
    supabase
      .from("site_content")
      .select("key, value")
      .in("key", ["hero_video_url", "hero_video_mobile_url"])
      .then(({ data }) => {
        if (!data) return;
        data.forEach((item) => {
          if (item.key === "hero_video_url" && item.value) setDesktopVideoSrc(item.value);
          if (item.key === "hero_video_mobile_url" && item.value) setMobileVideoSrc(item.value);
        });
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.from(headlineRef.current, { opacity: 0, y: 40, duration: 0.9 })
        .from(subRef.current, { opacity: 0, y: 20, duration: 0.7 }, "-=0.4")
        .from(ctaRef.current, { opacity: 0, y: 20, duration: 0.6 }, "-=0.4");
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-[#050505]"
    >
      {/* Desktop video (landscape) — hidden on mobile */}
      <video
        key={`desktop-${desktopVideoSrc}`}
        className="hidden sm:block absolute inset-0 w-full h-full object-cover opacity-30"
        src={desktopVideoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Mobile video (portrait/vertical) — hidden on desktop */}
      <video
        key={`mobile-${mobileVideoSrc}`}
        className="block sm:hidden absolute inset-0 w-full h-full object-cover opacity-30"
        src={mobileVideoSrc}
        autoPlay
        muted
        loop
        playsInline
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/60 via-transparent to-[#050505]/80" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8 text-center">
        <h1
          ref={headlineRef}
          className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight"
          style={{ fontWeight: 800 }}
        >
          We Make Brands
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #36FF9D, #01F17C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Impossible to Ignore
          </span>
        </h1>

        <p
          ref={subRef}
          className="mt-6 text-base sm:text-lg text-white/60 font-400 tracking-wide max-w-xl mx-auto"
        >
          VFX · CGI · Social Media · Branding — Kuwait &amp; GCC
        </p>

        <div ref={ctaRef} className="mt-10 flex items-center justify-center gap-4">
          <Link
            href="/portfolio"
            className="px-8 py-4 text-sm font-700 rounded-2xl border-2 border-[#01F17C] text-[#01F17C] hover:bg-[#01F17C] hover:text-[#050505] transition-all duration-300"
          >
            See Our Work
          </Link>
          <Link
            href="/contact"
            className="px-8 py-4 text-sm font-700 rounded-2xl bg-white/10 text-white hover:bg-white/20 transition-all duration-300 backdrop-blur-sm"
          >
            Let&apos;s Talk
          </Link>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
        <span className="text-white text-xs tracking-widest uppercase">Scroll</span>
        <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
      </div>
    </section>
  );
}
