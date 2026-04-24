import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Video Production Company in Kuwait | Astroshot",
  description:
    "Astroshot is a premium video production company in Kuwait. We produce commercials, brand films, social media videos, and corporate content for brands across Kuwait and the GCC.",
  keywords: [
    "video production Kuwait",
    "video production company Kuwait",
    "commercial video production Kuwait",
    "brand film Kuwait",
    "corporate video Kuwait",
    "video agency Kuwait",
    "video content GCC",
  ],
};

const services = [
  "Commercial video production",
  "Brand films and corporate videos",
  "Social media video content",
  "Product and launch videos",
  "Event coverage and highlights",
  "Testimonial and interview videos",
  "Aerial and drone videography",
];

const benefits = [
  "End-to-end production from concept to delivery",
  "In-house creative direction and scripting",
  "VFX and 3D integration capability",
  "Kuwait and GCC market expertise",
  "Multi-format delivery for all platforms",
];

const videoTypes = [
  "TV and digital commercials",
  "Instagram Reels and TikTok content",
  "Product launch films",
  "Corporate brand stories",
  "Event highlight reels",
  "YouTube and OTT content",
];

const faqs = [
  {
    q: "What does a video production company do?",
    a: "A video production company handles the full process of creating video content — from concept and scripting through filming, editing, VFX, and final delivery. Astroshot manages every stage in-house, ensuring creative quality and consistency from start to finish.",
  },
  {
    q: "How much does video production cost in Kuwait?",
    a: "Video production cost in Kuwait depends on the type of video, duration, location requirements, talent, and post-production complexity. Astroshot works across a range of scopes and budgets — from focused social media videos to full-scale commercial productions.",
  },
  {
    q: "How long does video production take?",
    a: "A standard social media or commercial video typically takes 2-4 weeks from brief to delivery. Larger productions with VFX or multiple shoot days take longer. Astroshot provides a clear timeline for every project before work begins.",
  },
  {
    q: "Does Astroshot provide scripting and creative direction?",
    a: "Yes. Astroshot offers full creative development including concept, scripting, storyboarding, and creative direction. You can come with a brief, an idea, or nothing at all — we will develop the concept with you.",
  },
  {
    q: "Can Astroshot produce videos for social media formats?",
    a: "Yes. All Astroshot video productions are delivered in the formats needed — vertical 9:16 for Instagram Reels and TikTok, horizontal 16:9 for YouTube and broadcast, and square 1:1 for feed posts.",
  },
  {
    q: "Does Astroshot do video production outside Kuwait?",
    a: "Yes. Astroshot has produced video content for clients across Kuwait, Saudi Arabia, and the UAE. We are available for shoots throughout the GCC.",
  },
];

export default function VideoProductionKuwaitPage() {
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
            Video Production
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Video Production Company in Kuwait for Brands That Mean Business
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot produces commercials, brand films, and social media video content for brands in Kuwait and the GCC — with in-house creative direction, production, and VFX capability.
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
              Astroshot handles video production end-to-end — concept, script, shoot, edit, VFX, and delivery. We produce content that is built for performance: designed to capture attention, communicate clearly, and make brands look exactly as premium as they deserve to be.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              Video Services We Offer
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
              Video Types We Produce
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              From broadcast commercials to social-first content, Astroshot produces video across every format and platform.
            </p>
            <ul className="mt-6 space-y-3">
              {videoTypes.map((item) => (
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
              Most video production companies shoot and edit. Astroshot brings creative direction, VFX capability, and strategic thinking to every production. The result is video content that does more than look good — it performs.
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
            Need video content that actually performs?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s produce something your audience won&apos;t skip.
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
