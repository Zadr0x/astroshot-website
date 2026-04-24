import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "3D Animation Company in Kuwait | Astroshot",
  description:
    "Astroshot is Kuwait's leading 3D animation company. We create 3D product animation, architectural visualization, animated brand content, and digital campaigns for brands across Kuwait and the GCC.",
  keywords: [
    "3D animation Kuwait",
    "3D animation company Kuwait",
    "3D product animation Kuwait",
    "motion graphics Kuwait",
    "3D rendering Kuwait",
    "animation studio Kuwait",
    "3D visual Kuwait",
  ],
};

const services = [
  "3D product animation",
  "Architectural and interior visualization",
  "Animated brand commercials",
  "Motion graphics and kinetic typography",
  "3D character animation",
  "Product configurator visuals",
  "Social media 3D content",
];

const benefits = [
  "Photorealistic render quality",
  "Full creative control over environment and lighting",
  "No physical production costs or constraints",
  "Scalable for multiple formats and sizes",
  "Ideal for products that don't exist yet",
];

const useCases = [
  "Automotive product reveals",
  "Real estate and property marketing",
  "Consumer electronics launches",
  "FMCG and packaged goods",
  "Luxury and premium brand content",
  "App and tech product explainers",
];

const faqs = [
  {
    q: "What is 3D animation used for in advertising?",
    a: "3D animation is used to create product reveals, brand commercials, explainer videos, and premium visual content that would be impossible, expensive, or impractical to film in the real world. It gives brands complete control over every visual element.",
  },
  {
    q: "How much does 3D animation cost in Kuwait?",
    a: "3D animation pricing depends on the complexity of the scene, number of assets, render quality, duration, and the number of deliverables. Astroshot works across different budget levels — from focused product animation to full-scale 3D commercial campaigns.",
  },
  {
    q: "How long does a 3D animation project take?",
    a: "A standard 3D product animation typically takes 2-4 weeks. Complex scenes with multiple assets, characters, or environments take longer. Astroshot provides a clear timeline at the start of every project.",
  },
  {
    q: "What file formats does Astroshot deliver?",
    a: "Astroshot delivers 3D animation in all required formats — MP4, MOV, ProRes, and platform-specific formats for Instagram, TikTok, YouTube, and broadcast. Aspect ratios are adapted per platform as needed.",
  },
  {
    q: "Can 3D animation be used for social media content?",
    a: "Absolutely. 3D animation performs exceptionally well on social media — particularly for product launches, reveals, and premium brand storytelling on Instagram and TikTok. Astroshot produces 3D content specifically optimised for social-first performance.",
  },
  {
    q: "Does Astroshot create 3D animation for real estate?",
    a: "Yes. Astroshot produces architectural visualization and interior 3D renders for real estate developers and property brands in Kuwait and the GCC — including walkthrough videos, exterior renders, and marketing content.",
  },
];

export default function AnimationKuwaitPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24">
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
            3D Animation
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            3D Animation Company in Kuwait for Premium Brand Content
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates photorealistic 3D animation, product visualization, and animated brand campaigns for businesses in Kuwait and the GCC — with full creative control and premium render quality.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              href="/portfolio"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors"
            >
              View Our Work
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
            >
              Start Your Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              What We Do
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot creates 3D animation and visualization content that gives brands complete creative control over their visual storytelling. From product animation to full 3D commercial campaigns, we produce work that is photorealistic, premium, and designed to perform across every platform and format.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              3D Animation Services
            </h3>
            <ul className="space-y-3">
              {services.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="w-5 h-5 rounded-full bg-[#01F17C]/15 border border-[#01F17C]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#01F17C] text-xs">✓</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h2 className="text-3xl font-extrabold text-white tracking-tight">
              Industries and Use Cases
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              3D animation works exceptionally well across a range of industries — anywhere that premium visual storytelling creates a competitive advantage.
            </p>
            <ul className="mt-6 space-y-3">
              {useCases.map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-white/90">
                  <span className="w-5 h-5 rounded-full bg-[#01F17C]/15 border border-[#01F17C]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#01F17C] text-xs">✓</span>
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Why 3D Animation
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              3D animation removes the constraints of the physical world. Perfect lighting, impossible camera angles, products that don't exist yet — all achievable. For brands that want to present their products and stories at the highest possible visual level, 3D is often the answer.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {benefits.map((item) => (
                <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-5 text-sm text-white/85">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <div className="mt-8 space-y-4">
            {faqs.map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white">{faq.q}</h3>
                <p className="mt-3 text-white/65 leading-relaxed text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="py-24 lg:py-32 bg-[#050505]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-4xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Want to show your product at its absolute best?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s create 3D content that makes your brand impossible to ignore.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Start Your Project
          </Link>
        </div>
      </section>
    </div>
  );
}
