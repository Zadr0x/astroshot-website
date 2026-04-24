import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Branding Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a premium branding agency in Kuwait. We create brand identities, visual systems, and brand strategy for businesses across Kuwait and the GCC that want to stand out.",
  keywords: [
    "branding agency Kuwait",
    "brand identity Kuwait",
    "logo design Kuwait",
    "brand strategy Kuwait",
    "visual identity Kuwait",
    "branding company Kuwait",
    "brand design GCC",
  ],
};

const services = [
  "Brand identity and logo design",
  "Visual identity systems",
  "Brand strategy and positioning",
  "Brand guidelines and documentation",
  "Packaging design",
  "Brand naming and messaging",
  "Rebranding and brand refresh",
];

const benefits = [
  "Premium, distinctive visual direction",
  "Rooted in Kuwait and GCC market context",
  "Strategy-led, not just aesthetics",
  "Consistent brand system across all touchpoints",
  "Built to scale as the brand grows",
];

const deliverables = [
  "Logo suite (primary, secondary, icon)",
  "Color palette and typography system",
  "Brand guidelines document",
  "Social media visual templates",
  "Business cards and stationery",
  "Digital asset library",
];

const faqs = [
  {
    q: "What does a branding agency do?",
    a: "A branding agency creates the visual and strategic identity of a business. This includes logo design, color palette, typography, brand voice, messaging, and the overall system that makes a brand immediately recognisable and consistent across all touchpoints.",
  },
  {
    q: "How much does branding cost in Kuwait?",
    a: "Branding investment in Kuwait depends on the scope — from startup identity packages to full enterprise rebranding. Astroshot works across different budget levels and scopes, always prioritising quality and longevity over shortcuts.",
  },
  {
    q: "How long does a branding project take?",
    a: "A complete brand identity project typically takes 3-6 weeks depending on complexity, number of revision rounds, and how quickly feedback is provided. Astroshot provides a clear timeline at the start of every project.",
  },
  {
    q: "What is included in a brand identity package?",
    a: "A standard Astroshot brand identity includes logo suite, color palette, typography system, brand guidelines, and digital asset library. Extended packages can include packaging, marketing templates, and social media visual systems.",
  },
  {
    q: "Does Astroshot do rebranding for existing businesses?",
    a: "Yes. Astroshot handles both new brand creation and rebranding for established businesses that have outgrown their current identity or want to reposition in the market.",
  },
  {
    q: "Why does good branding matter?",
    a: "Strong branding builds recognition, trust, and perceived value. In competitive markets like Kuwait and the GCC, a premium brand identity is often the difference between being chosen and being overlooked — especially in categories where multiple options exist.",
  },
];

export default function BrandingAgencyKuwaitPage() {
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
            Branding
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Branding Agency in Kuwait for Brands Built to Last
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates premium brand identities, visual systems, and brand strategy for businesses in Kuwait and the GCC that want to stand out, build trust, and grow.
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
              Start Your Brand
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
              Astroshot builds brand identities from the ground up — starting with strategy and positioning, moving through visual identity design, and delivering a complete brand system that works consistently across every touchpoint. We create brands that look premium, communicate clearly, and grow with the business.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              Branding Services
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
              What You Get
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              Every Astroshot branding project delivers a complete system — not just a logo. We build everything a brand needs to show up consistently, look premium, and grow.
            </p>
            <ul className="mt-6 space-y-3">
              {deliverables.map((item) => (
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
              Astroshot brings premium creative taste, Kuwait market knowledge, and strategic thinking to every branding project. We don't produce generic identities — we build brands that are distinctive, culturally relevant, and built for long-term growth in the GCC market.
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
            Ready to build a brand people actually remember?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s create a brand identity that positions you exactly where you want to be.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Start Your Brand
          </Link>
        </div>
      </section>
    </div>
  );
}
