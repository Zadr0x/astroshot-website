import type { Metadata } from "next";
import Link from "next/link";
import ClientLogoWall from "@/components/sections/ClientLogoWall";

export const metadata: Metadata = {
  title: "About — Kuwait's #1 Creative Agency",
  description:
    "Learn about Astroshot Project Management Company — Kuwait's leading VFX, CGI, and creative agency with 500M+ organic views and 170+ clients across the GCC.",
};

const timeline = [
  { year: "2018", event: "Astroshot founded in Kuwait City with a team of 3." },
  { year: "2020", event: "First automotive campaign for a major GCC brand. 10M+ views." },
  { year: "2020", event: "Expanded services to full VFX and CGI production." },
  { year: "2022", event: "100+ clients. First National Geographic campaign." },
  { year: "2024", event: "500M+ organic views milestone. 170+ brands served." },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24">
      {/* Hero */}
      <div className="relative py-24 lg:py-32 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 20% 30%, rgba(1,241,124,0.1), transparent 60%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            About Astroshot
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.05]">
            We&apos;ve been making brands impossible to ignore since 2018.
          </h1>
        </div>
      </div>

      {/* Stats highlight */}
      <div className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { number: "500M+", label: "Organic Views Generated" },
              { number: "170+", label: "Happy Clients" },
              { number: "6+", label: "Years of Excellence" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8 hover:border-[#01F17C]/30 transition-colors"
              >
                <div className="text-5xl font-black text-white mb-2">
                  {stat.number}
                </div>
                <p className="text-white/60 text-sm font-medium uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-6 pl-6 border-l-4 border-[#01F17C]">
              Our Mission
            </h2>
            <p className="text-white/70 leading-relaxed mb-4">
              Astroshot was born from a simple belief: Gulf brands deserve
              world-class creative. Too often, international-calibre production
              meant flying in foreign studios at enormous cost. We built
              Astroshot to fix that.
            </p>
            <p className="text-white/70 leading-relaxed mb-4">
              Today we&apos;re Kuwait&apos;s most trusted creative production
              company — a studio where VFX artists, 3D animators, strategists,
              and brand designers work under one roof, obsessively focused on
              making every frame count.
            </p>
            <p className="text-white/70 leading-relaxed">
              Our work has reached over 500 million people organically. Not
              through paid shortcuts — through craft.
            </p>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-3xl font-extrabold text-white mb-6">
              Our Journey
            </h2>
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-[#01F17C] mt-1.5 flex-shrink-0 shadow-[0_0_8px_rgba(1,241,124,0.6)]" />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-white/10 mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <span className="text-xs font-bold text-[#01F17C] uppercase tracking-widest">
                      {item.year}
                    </span>
                    <p className="mt-1 text-sm text-white/70">{item.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Clients */}
      <ClientLogoWall />

      {/* Address */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-3">
              Office
            </h3>
            <p className="text-white font-medium leading-relaxed">
              Qibla Block 13, Fahad Al Salem Street
              <br />
              Al Salam Tower, 16th Floor, Office 7
              <br />
              Kuwait City, Kuwait
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:info@astroshotpm.com"
                className="block text-white font-medium hover:text-[#01F17C] transition-colors"
              >
                info@astroshotpm.com
              </a>
              <a
                href="tel:+96593336065"
                className="block text-white font-medium hover:text-[#01F17C] transition-colors"
              >
                +965 9333 6065
              </a>
              <a
                href="https://instagram.com/astroshotmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-white font-medium hover:text-[#01F17C] transition-colors"
              >
                @astroshotmedia
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-24">
        <Link
          href="/contact"
          className="inline-block px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
        >
          Work With Us
        </Link>
      </div>
    </div>
  );
}
