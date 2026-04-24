import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "CGI Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a CGI agency in Kuwait creating high-impact 3D commercials, product visualization, launch content, and digital campaigns for brands across Kuwait and the GCC.",
  keywords: [
    "CGI agency Kuwait",
    "CGI studio Kuwait",
    "3D commercials Kuwait",
    "product visualization Kuwait",
    "CGI production Kuwait",
    "CGI advertising GCC",
  ],
};

const services = [
  "CGI commercials",
  "Product visualization",
  "3D product animation",
  "Digital launch content",
  "Automotive CGI campaigns",
  "Mixed reality / CGI integration",
  "Social media CGI assets",
];

const benefits = [
  "Premium visual impact",
  "Faster concept execution",
  "High control over environment and lighting",
  "Scalable content for multiple formats",
  "Ideal for launches, reveals, and social campaigns",
];

const projectTypes = [
  "Automotive launches",
  "Product reveals",
  "Retail campaigns",
  "Social-first CGI ads",
  "Digital billboards / OOH visuals",
  "Commercial storytelling",
];

const faqs = [
  {
    q: "What does a CGI agency do?",
    a: "A CGI agency creates computer-generated visuals for advertising, product launches, commercial storytelling, and branded content. This includes 3D animation, product visualization, virtual scenes, and digital campaign assets.",
  },
  {
    q: "How is CGI used in advertising?",
    a: "CGI is used to create commercials, launch films, product reveals, and premium branded content that would be difficult, expensive, or impossible to produce traditionally. It gives brands more control and more visual ambition.",
  },
  {
    q: "Is CGI better than traditional production?",
    a: "Not always — but for many campaigns, CGI offers more flexibility, more visual control, and stronger creative possibilities. It is especially effective for product storytelling, automotive launches, and digital-first campaigns.",
  },
  {
    q: "How much does CGI production cost in Kuwait?",
    a: "CGI production cost depends on complexity, quality level, duration, and campaign scope. Premium CGI work is usually priced based on concept difficulty, render demands, and the number of deliverables needed.",
  },
  {
    q: "Can Astroshot create CGI for social media campaigns?",
    a: "Yes. Astroshot creates CGI content for Instagram, TikTok, launch campaigns, digital ads, and broader social-first content systems.",
  },
  {
    q: "Does Astroshot work with brands outside Kuwait?",
    a: "Yes. Astroshot works with brands across Kuwait and the wider GCC, including Saudi Arabia and the UAE.",
  },
];

export default function CgiAgencyKuwaitPage() {
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
            CGI Services
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            CGI Agency in Kuwait for High-Impact Brand Campaigns
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates cinematic CGI content, product visualization, and premium 3D commercial production for brands in Kuwait and across the GCC.
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
              Astroshot helps brands use CGI to create attention-grabbing campaigns, product launches, and commercial content that would be difficult, expensive, or impossible to produce traditionally. From automotive reveals to product storytelling, our CGI work is designed to make brands impossible to ignore.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              CGI Services We Offer
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
              Why Brands Use CGI
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              CGI gives brands more control, more visual ambition, and more flexibility. It allows products, vehicles, spaces, and stories to be presented in ways that live-action alone often cannot achieve.
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
              Astroshot combines creative direction, premium visual taste, and campaign thinking with CGI execution. We don&apos;t just make visuals look impressive — we build content that is designed to perform in the real world for brands in Kuwait and across the GCC.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                "500M+ organic views",
                "Major regional and global clients",
                "Automotive, banking, retail, and launch experience",
                "Kuwait-based, GCC-focused execution",
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
            CGI Project Types
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
            Need a CGI campaign that actually stands out?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build CGI content that turns attention into brand impact.
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
