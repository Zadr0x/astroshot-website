import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Motion Graphics Company in Kuwait | Astroshot",
  description:
    "Astroshot is a leading motion graphics company in Kuwait. We create animated explainers, branded motion content, kinetic typography, and premium motion design for brands across Kuwait and the GCC.",
  keywords: [
    "motion graphics Kuwait",
    "motion graphics company Kuwait",
    "animated video Kuwait",
    "explainer video Kuwait",
    "motion design Kuwait",
    "animation Kuwait",
    "kinetic typography Kuwait",
  ],
};

const services = [
  "Brand motion graphics and intros",
  "Animated explainer videos",
  "Kinetic typography and text animation",
  "Social media motion content",
  "Infographic animation",
  "Logo animation and reveal",
  "Presentation and slide animation",
];

const useCases = [
  "Product and service explainers",
  "Social media animated posts",
  "Brand launch and reveal content",
  "Corporate presentations",
  "Digital out-of-home (DOOH) screens",
  "App onboarding and UI animation",
];

const benefits = [
  "Communicates complex ideas simply and visually",
  "Works across every platform and format",
  "No filming or location costs required",
  "Fast turnaround compared to live production",
  "Consistent brand identity in motion",
];

const faqs = [
  {
    q: "What are motion graphics?",
    a: "Motion graphics are animated visual content that combines graphic design with movement. This includes animated logos, explainer videos, kinetic typography, infographics, and branded motion content — used across social media, digital advertising, presentations, and broadcast.",
  },
  {
    q: "How is motion graphics different from video production?",
    a: "Motion graphics are entirely digitally created — no filming required. They are faster to produce than live video for certain content types, and are ideal for explaining concepts, animating data, or creating premium branded content without the need for a physical shoot.",
  },
  {
    q: "How much does motion graphics cost in Kuwait?",
    a: "Motion graphics pricing depends on the complexity of the animation, duration, number of assets, and the overall production scope. Astroshot works across different budget levels — from simple logo animations to full animated brand campaigns.",
  },
  {
    q: "How long does a motion graphics project take?",
    a: "A standard motion graphics video typically takes 1-3 weeks depending on complexity, length, and revision rounds. Rush timelines can sometimes be accommodated — contact Astroshot to discuss your deadline.",
  },
  {
    q: "Can motion graphics be used for social media?",
    a: "Yes — motion graphics are extremely effective on social media. Animated content typically outperforms static images in reach and engagement. Astroshot produces motion graphics specifically optimised for Instagram, TikTok, LinkedIn, and other platforms.",
  },
  {
    q: "Does Astroshot create motion graphics in Arabic?",
    a: "Yes. Astroshot produces bilingual motion graphics in Arabic and English, with typography and layout adapted for right-to-left Arabic text where needed.",
  },
];

export default function MotionGraphicsKuwaitPage() {
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
            Motion Graphics
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Motion Graphics Company in Kuwait for Brands in Motion
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates premium motion graphics, animated brand content, and explainer videos for businesses in Kuwait and the GCC — designed to communicate clearly and perform across every platform.
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
              Astroshot creates motion graphics that bring brands to life visually — from animated logos and social media content to full explainer videos and branded motion campaigns. Every piece is crafted with premium design standards and built for the platforms and audiences that matter to your business.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              Motion Graphics Services
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
              Use Cases
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              Motion graphics are one of the most versatile content formats available — effective across social media, digital advertising, presentations, and broadcast.
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
              Why Motion Graphics
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Motion graphics combine the impact of video with the precision of design. They work when live production isn't practical, communicate complex ideas quickly, and maintain consistent brand identity in motion — across every format and screen size.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-4">
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
            Let&apos;s put your brand in motion.
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Tell us what you need and we&apos;ll build motion graphics that actually work.
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
