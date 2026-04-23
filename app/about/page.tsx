import type { Metadata } from "next";
import ClientLogoWall from "@/components/sections/ClientLogoWall";

export const metadata: Metadata = {
  title: "About — Kuwait's #1 Creative Agency",
  description:
    "Learn about Astroshot Project Management Company — Kuwait's leading VFX, CGI, and creative agency with 500M+ organic views and 170+ clients across the GCC.",
};



const timeline = [
  {
    year: "2018",
    event: "Astroshot founded in Kuwait City with a team of 3.",
  },
  {
    year: "2020",
    event: "First automotive campaign for a major GCC brand. 10M+ views.",
  },
  {
    year: "2020",
    event: "Expanded services to full VFX and CGI production.",
  },
  {
    year: "2022",
    event: "100+ clients. First National Geographic campaign.",
  },
  {
    year: "2024",
    event: "500M+ organic views milestone. 170+ brands served.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pt-24">
      {/* Hero */}
      <div className="bg-[#050505] py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <span className="text-xs font-700 uppercase tracking-[0.25em] text-[#00a855]">
            About Astroshot
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-800 text-white tracking-tight max-w-3xl leading-tight">
            We&apos;ve been making brands impossible to ignore since 2018.
          </h1>
        </div>
      </div>

      {/* Stats highlight */}
      <div className="bg-[#FAFAFA] py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { number: "500M+", label: "Organic Views Generated" },
              { number: "170+", label: "Happy Clients" },
              { number: "8+", label: "Years of Excellence" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl bg-white border border-[#f0f0f0] p-8"
              >
                <div className="text-5xl font-900 text-[#111111] mb-2">
                  {stat.number}
                </div>
                <p className="text-[#666666] text-sm font-500 uppercase tracking-widest">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <h2 className="text-3xl font-800 text-[#111111] mb-6 pl-6 border-l-4 border-[#01F17C]">
              Our Mission
            </h2>
            <p className="text-[#666666] leading-relaxed mb-4">
              Astroshot was born from a simple belief: Gulf brands deserve
              world-class creative. Too often, international-calibre production
              meant flying in foreign studios at enormous cost. We built
              Astroshot to fix that.
            </p>
            <p className="text-[#666666] leading-relaxed mb-4">
              Today we&apos;re Kuwait&apos;s most trusted creative production
              company — a studio where VFX artists, 3D animators, strategists,
              and brand designers work under one roof, obsessively focused on
              making every frame count.
            </p>
            <p className="text-[#666666] leading-relaxed">
              Our work has reached over 500 million people organically. Not
              through paid shortcuts — through craft.
            </p>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="text-3xl font-800 text-[#111111] mb-6">
              Our Journey
            </h2>
            <div className="space-y-6">
              {timeline.map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-[#01F17C] mt-1.5 flex-shrink-0" />
                    {i < timeline.length - 1 && (
                      <div className="w-px flex-1 bg-[#f0f0f0] mt-2" />
                    )}
                  </div>
                  <div className="pb-6">
                    <span className="text-xs font-700 text-[#01F17C] uppercase tracking-widest">
                      {item.year}
                    </span>
                    <p className="mt-1 text-sm text-[#666666]">{item.event}</p>
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
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="rounded-2xl bg-white border border-[#f0f0f0] p-8">
            <h3 className="text-xs font-700 uppercase tracking-widest text-[#999999] mb-3">
              Office
            </h3>
            <p className="text-[#111111] font-600">
              Qibla Block 13, Fahad Al Salem Street
              <br />
              Al Salam Tower, 16th Floor, Office 7
              <br />
              Kuwait City, Kuwait
            </p>
          </div>
          <div className="rounded-2xl bg-white border border-[#f0f0f0] p-8">
            <h3 className="text-xs font-700 uppercase tracking-widest text-[#999999] mb-3">
              Contact
            </h3>
            <div className="space-y-2">
              <a
                href="mailto:info@astroshotpm.com"
                className="block text-[#111111] font-500 hover:text-[#01F17C] transition-colors"
              >
                info@astroshotpm.com
              </a>
              <a
                href="tel:+96593336065"
                className="block text-[#111111] font-500 hover:text-[#01F17C] transition-colors"
              >
                +965 9333 6065
              </a>
              <a
                href="https://instagram.com/astroshotmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="block text-[#111111] font-500 hover:text-[#01F17C] transition-colors"
              >
                @astroshotmedia
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="text-center pb-20">
        <Link
          href="/contact"
          className="inline-block px-8 py-4 text-sm font-700 rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
        >
          Work With Us
        </Link>
      </div>
    </div>
  );
}
