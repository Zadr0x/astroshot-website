import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VFX, CGI, Social Media & AI Content Services in Kuwait | Astroshot",
  description:
    "Astroshot provides VFX, CGI, social media content, cinematic AI content, and motion graphics services for brands in Kuwait and across the GCC.",
  keywords: [
    "VFX agency Kuwait",
    "CGI agency Kuwait",
    "social media agency Kuwait",
    "AI content agency Kuwait",
    "motion graphics Kuwait",
    "marketing agency Kuwait",
  ],
};

const services = [
  {
    id: "mixed-reality",
    number: "01",
    title: "Mixed Reality",
    headline: "High-Impact VFX Campaigns",
    description:
      "Mixed reality content that combines live-action production with VFX to create high-impact campaigns for launches, products, and social media. Astroshot produces mixed reality ads and visual storytelling for brands across Kuwait and the GCC.",
    deliverables: [
      "Mixed Reality Campaigns",
      "Visual Effects (VFX) Production",
      "Launch Films & Product Reveals",
      "Compositing & Color Grading",
      "Social & Commercial Formats",
    ],
  },
  {
    id: "full-cgi",
    number: "02",
    title: "Full CGI",
    headline: "Premium 3D Visual Production",
    description:
      "Full CGI production with cinematic 3D visuals for product campaigns, commercial storytelling, and branded content. Astroshot delivers CGI advertising, product visualization, and high-end digital production for brands that want premium visual impact.",
    deliverables: [
      "CGI Advertising",
      "Product Visualization",
      "3D Commercial Scenes",
      "Digital Launch Content",
      "High-End Render Production",
    ],
  },
  {
    id: "cinematic-ai-content",
    number: "03",
    title: "Cinematic AI Content",
    headline: "AI-Powered Storytelling",
    description:
      "Cinematic AI content built for modern brands that want story-driven ads, AI-powered scenes, and visually striking commercial content. Astroshot uses AI filmmaking and creative direction to produce campaigns that feel current, cinematic, and attention-grabbing.",
    deliverables: [
      "AI Commercial Content",
      "Story-Driven AI Scenes",
      "Concept Visualization",
      "Creative Direction",
      "Campaign Content Development",
    ],
  },
  {
    id: "social-media-content",
    number: "04",
    title: "Social Media Content",
    headline: "Built for Reach and Relevance",
    description:
      "Social media content creation for Instagram, TikTok, and digital campaigns, including strategy, filming, editing, creative direction, and monthly content planning. Astroshot helps brands grow with content built for reach, relevance, and engagement.",
    deliverables: [
      "Content Strategy & Planning",
      "Instagram & TikTok Content",
      "Filming & Editing",
      "Creative Direction",
      "Monthly Content Systems",
    ],
  },
  {
    id: "motion-graphics",
    number: "05",
    title: "Motion Graphics",
    headline: "Clarity with Visual Impact",
    description:
      "Motion graphics and animated content that explain products, services, offers, and digital experiences in a clear and visually engaging way. Astroshot creates motion design, 2D and 3D animation, and commercial content for brands that need clarity with impact.",
    deliverables: [
      "Motion Design",
      "2D & 3D Animation",
      "Explainer Content",
      "Commercial Motion Graphics",
      "Animated Digital Assets",
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
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            VFX, CGI, Social Media & AI Content Services in Kuwait
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot provides VFX, CGI, social media content, cinematic AI content, and motion graphics services for brands in Kuwait and across the GCC. From launch campaigns and mixed reality ads to always-on content systems, we create work designed to capture attention and drive results.
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
            Not sure which service fits your campaign?
          </h2>
          <p className="mt-4 text-white/60 max-w-2xl mx-auto leading-relaxed">
            We&apos;ll help you choose the right creative direction based on your goals, audience, and launch needs.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Start Your Project
          </Link>
        </div>
      </div>
    </div>
  );
}
