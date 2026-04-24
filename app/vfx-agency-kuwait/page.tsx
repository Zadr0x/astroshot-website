import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "VFX Agency in Kuwait | Astroshot",
  description:
    "Astroshot is Kuwait's leading VFX agency. We create cinematic visual effects, 3D VFX commercials, and high-impact brand campaigns for major brands across Kuwait and the GCC.",
  keywords: [
    "VFX agency Kuwait",
    "VFX production Kuwait",
    "visual effects Kuwait",
    "VFX commercials Kuwait",
    "VFX studio GCC",
    "3D VFX Kuwait",
    "cinematic VFX Kuwait",
  ],
};

const services = [
  "VFX commercials and brand films",
  "3D visual effects integration",
  "Product launch VFX campaigns",
  "Automotive VFX production",
  "Motion graphics and VFX",
  "Social media VFX content",
  "Mixed live-action and VFX",
];

const benefits = [
  "Cinematic quality at commercial scale",
  "Kuwait-based team with GCC market knowledge",
  "500M+ organic views delivered for clients",
  "End-to-end creative + VFX execution",
  "Proven results for automotive, banking, and retail",
];

const projectTypes = [
  "Automotive launch films",
  "Product reveal campaigns",
  "Brand identity films",
  "Social-first VFX ads",
  "Corporate VFX productions",
  "Event and activation content",
];

const faqs = [
  {
    q: "What is a VFX agency?",
    a: "A VFX agency specializes in creating visual effects for commercials, brand films, and digital campaigns. This includes 3D animation, motion graphics, compositing, and cinematic effects that elevate branded content beyond what traditional production can achieve.",
  },
  {
    q: "How is VFX used in advertising?",
    a: "VFX is used to create high-impact brand commercials, product launches, automotive films, and social media campaigns. It allows brands to tell bigger visual stories, create impossible scenes, and produce content that genuinely stops people from scrolling.",
  },
  {
    q: "How much does VFX production cost in Kuwait?",
    a: "VFX production pricing depends on the complexity of the work, the number of shots, render quality, and the campaign scope. Astroshot works across a range of budgets and scopes — from single social media VFX assets to full brand campaigns.",
  },
  {
    q: "Does Astroshot do VFX for social media?",
    a: "Yes. Astroshot produces VFX content specifically designed for Instagram Reels, TikTok, and social-first formats — not just traditional broadcast.",
  },
  {
    q: "What industries does Astroshot work with?",
    a: "Astroshot has produced VFX campaigns for automotive brands, banking and finance, telecom, retail, F&B, and consumer goods across Kuwait, Saudi Arabia, and the UAE.",
  },
  {
    q: "Can Astroshot handle both creative direction and VFX production?",
    a: "Yes. Astroshot provides end-to-end service from concept and creative direction through to VFX production and final delivery. You don't need a separate creative agency.",
  },
];

export default function VfxAgencyKuwaitPage() {
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
            VFX Production
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            VFX Agency in Kuwait for Cinematic Brand Campaigns
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot is Kuwait's leading VFX agency. We produce high-impact visual effects, 3D brand films, and cinematic commercial content for brands across Kuwait and the GCC.
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
              Astroshot creates VFX-driven brand content that combines cinematic visual effects with sharp commercial thinking. From automotive launch films to product reveal campaigns, our VFX work is built to perform — capturing attention, driving engagement, and making brands stand out in Kuwait and across the GCC.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              VFX Services We Offer
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
              Why Brands Choose VFX
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              VFX gives brands the ability to create visual content that is impossible to achieve through traditional production alone. It unlocks bigger creative ambition, stronger brand storytelling, and content that genuinely performs in competitive digital environments.
            </p>
            <ul className="mt-6 space-y-3">
              {benefits.map((item) => (
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
              Why Astroshot
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot brings together premium VFX capability and real commercial creative thinking. We have produced VFX campaigns for some of Kuwait's most recognised brands — and we understand what it takes to create content that works in the Kuwait and GCC market specifically.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "500M+ organic views",
                "Mercedes, Gulf Bank, Honda & more",
                "Kuwait-based, GCC market focused",
                "Creative + VFX under one roof",
              ].map((item) => (
                <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-5 text-sm text-white/85">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            VFX Project Types
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {projectTypes.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 text-sm text-white/90">
                {item}
              </div>
            ))}
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
            Ready to make content that actually stops people scrolling?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build a VFX campaign that puts your brand in a different league.
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
