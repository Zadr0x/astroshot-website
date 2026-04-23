import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services — VFX, CGI, Branding & Social Media Kuwait",
  description:
    "Astroshot offers full-service VFX, CGI production, 3D animation, social media marketing, and branding services in Kuwait and across the GCC.",
  keywords: [
    "VFX Kuwait",
    "CGI videos Kuwait",
    "3D animation Kuwait",
    "social media marketing Kuwait",
    "branding agency Kuwait",
    "marketing agency Kuwait",
  ],
};

const services = [
  {
    id: "vfx",
    number: "01",
    title: "VFX & CGI",
    headline: "Hyper-Real Campaigns",
    description:
      "We create visual effects and CGI production that stops people mid-scroll. From cinematic automotive campaigns to explosive product launches — our VFX team delivers broadcast-quality results for social and OOH.",
    deliverables: [
      "Visual Effects (VFX) Production",
      "CGI Product Visualization",
      "Motion Graphics",
      "Compositing & Color Grading",
      "Broadcast & Social Formats",
    ],
  },
  {
    id: "social",
    number: "02",
    title: "Social Media",
    headline: "Strategy That Drives Real Growth",
    description:
      "End-to-end social media management across Instagram, TikTok, X, LinkedIn, and Snapchat. We don't just post — we build communities, run paid campaigns, and measure everything that matters.",
    deliverables: [
      "Content Strategy & Calendar",
      "Reels & Short-Form Video",
      "Community Management",
      "Paid Social Campaigns",
      "Analytics & Monthly Reports",
    ],
  },
  {
    id: "branding",
    number: "03",
    title: "Branding",
    headline: "Identities That Can't Be Forgotten",
    description:
      "We build brand identities from the ground up — or elevate existing ones. Logo design, typography, color systems, brand guidelines, and full visual identity packages that scale across every touchpoint.",
    deliverables: [
      "Logo & Visual Identity",
      "Brand Guidelines",
      "Packaging Design",
      "Brand Strategy",
      "Pitch Decks & Collateral",
    ],
  },
  {
    id: "3d",
    number: "04",
    title: "3D Animation",
    headline: "Motion That Makes Products the Hero",
    description:
      "Photo-realistic 3D animation and architectural visualization. Our 3D team handles everything from product hero shots to full explainer animations — all rendered in-house for complete quality control.",
    deliverables: [
      "Product 3D Animation",
      "Architectural Visualization",
      "Character Animation",
      "3D Explainer Videos",
      "Interactive 3D Assets",
    ],
  },
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 10% 20%, rgba(1,241,124,0.1), transparent 55%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            Services
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-3xl leading-[1.05]">
            Everything You Need to Win
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-lg">
            Four core disciplines. One studio. Fully integrated, obsessively
            executed.
          </p>
        </div>
      </div>

      {/* Services */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-5">
        {services.map((service) => (
          <div
            key={service.id}
            id={service.id}
            className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8 lg:p-12 scroll-mt-24 hover:border-[#01F17C]/30 transition-colors"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-xs font-bold text-[#01F17C] uppercase tracking-widest">
                    {service.number}
                  </span>
                  <div className="h-px flex-1 bg-white/10 max-w-[40px]" />
                </div>
                <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  {service.title}
                </h2>
                <p className="mt-1 text-lg font-semibold text-[#01F17C]">
                  {service.headline}
                </p>
                <p className="mt-4 text-white/70 leading-relaxed">
                  {service.description}
                </p>
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/50 mb-4">
                  What&apos;s Included
                </h3>
                <ul className="space-y-3">
                  {service.deliverables.map((d) => (
                    <li
                      key={d}
                      className="flex items-center gap-3 text-sm text-white/90"
                    >
                      <span className="w-5 h-5 rounded-full bg-[#01F17C]/15 border border-[#01F17C]/30 flex items-center justify-center flex-shrink-0">
                        <span className="text-[#01F17C] text-xs">✓</span>
                      </span>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden py-24 lg:py-32">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(1,241,124,0.1), transparent 60%)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight">
            Not sure which service you need?
          </h2>
          <p className="mt-4 text-white/60">
            We&apos;ll figure it out together.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Get a Free Consultation
          </Link>
        </div>
      </div>
    </div>
  );
}
