import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Social Media Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a premium social media agency in Kuwait. We manage Instagram, TikTok, and digital campaigns for major brands across Kuwait and the GCC — strategy, content, and results.",
  keywords: [
    "social media agency Kuwait",
    "social media management Kuwait",
    "Instagram management Kuwait",
    "TikTok agency Kuwait",
    "digital marketing agency Kuwait",
    "social media marketing GCC",
    "content creation Kuwait",
  ],
};

const services = [
  "Instagram management and growth",
  "TikTok content strategy and production",
  "Social media content creation",
  "Copywriting and caption management",
  "Graphic design and motion graphics",
  "Photography and videography",
  "Monthly performance reporting",
];

const benefits = [
  "Content built for Kuwait and GCC audiences",
  "Creative direction + execution in one team",
  "Consistent, premium output every month",
  "Data-informed content strategy",
  "Proven results across multiple industries",
];

const industries = [
  "Automotive",
  "Banking and finance",
  "F&B and restaurants",
  "Retail and fashion",
  "Telecom",
  "Real estate",
];

const faqs = [
  {
    q: "What does a social media agency do?",
    a: "A social media agency manages a brand's presence on platforms like Instagram and TikTok. This includes content strategy, content creation, post scheduling, community management, and performance tracking — all aimed at growing the brand's reach and engagement.",
  },
  {
    q: "How much does social media management cost in Kuwait?",
    a: "Social media management pricing in Kuwait varies based on the number of platforms, posting frequency, content complexity, and whether production (photography, video) is included. Astroshot offers packages tailored to different brand sizes and budgets.",
  },
  {
    q: "Does Astroshot do TikTok management?",
    a: "Yes. Astroshot offers dedicated TikTok management packages including strategy, scripting, filming, editing, and publishing — specifically designed for the Kuwait and GCC audience.",
  },
  {
    q: "What makes Astroshot different from other Kuwait social media agencies?",
    a: "Astroshot combines premium creative production with social media strategy. The content we create is designed to perform — not just look good. We bring VFX, 3D, and cinematic production capabilities that most social media agencies cannot offer.",
  },
  {
    q: "How long does it take to see results from social media management?",
    a: "Meaningful growth typically takes 2-3 months of consistent, strategic content. The first month is usually focused on building the content system, tone, and creative direction. Results compound over time.",
  },
  {
    q: "Does Astroshot work with brands outside Kuwait?",
    a: "Yes. Astroshot manages social media for brands across Kuwait, Saudi Arabia, and the wider GCC. We understand regional culture, Arabic-language content, and platform behaviour in Gulf markets.",
  },
];

export default function SocialMediaAgencyKuwaitPage() {
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
            Social Media Management
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Social Media Agency in Kuwait That Actually Delivers
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot manages Instagram, TikTok, and digital campaigns for brands in Kuwait and the GCC — with premium content creation, sharp strategy, and consistent results.
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
              Get a Proposal
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
              Astroshot provides full-service social media management — from strategy and content planning to production, publishing, and performance tracking. We handle everything so your brand shows up consistently, creatively, and with content that is designed to grow your audience and drive real results.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              Services Included
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
              Why It Works
            </h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              Most agencies produce average content. Astroshot produces content that performs. We combine creative production capabilities that most agencies don't have with a sharp understanding of what Kuwait and GCC audiences respond to.
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
              Industries We Serve
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot has managed social media for brands across a wide range of industries in Kuwait and the GCC — with content strategies built specifically for each sector and audience.
            </p>
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {industries.map((item) => (
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
            Ready to build a social media presence that actually grows?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s put together a content strategy and package that fits your brand and budget.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Get a Proposal
          </Link>
        </div>
      </section>
    </div>
  );
}
