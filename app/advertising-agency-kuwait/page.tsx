import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Advertising Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a leading advertising agency in Kuwait. We create high-impact advertising campaigns, digital ads, social media campaigns, and brand commercials for Kuwait and GCC brands.",
  keywords: [
    "advertising agency Kuwait",
    "ad agency Kuwait",
    "digital advertising Kuwait",
    "brand campaign Kuwait",
    "online advertising Kuwait",
    "social media advertising Kuwait",
    "advertising company Kuwait",
  ],
};

const services = [
  "Digital advertising campaigns",
  "Social media ads (Instagram, TikTok, Snapchat)",
  "VFX and CGI brand commercials",
  "Campaign strategy and creative direction",
  "Paid media management",
  "Outdoor and digital OOH advertising",
  "Launch and activation campaigns",
];

const campaignTypes = [
  "Product launch campaigns",
  "Brand awareness campaigns",
  "Seasonal and Ramadan campaigns",
  "National Day campaigns",
  "Performance and conversion campaigns",
  "Influencer and content campaigns",
];

const results = [
  {
    stat: "500M+",
    label: "Organic views generated",
  },
  {
    stat: "170+",
    label: "Brand campaigns delivered",
  },
  {
    stat: "10+",
    label: "Years in Kuwait market",
  },
  {
    stat: "GCC",
    label: "Kuwait, Saudi, UAE coverage",
  },
];

const faqs = [
  {
    q: "What does an advertising agency do?",
    a: "An advertising agency creates and manages campaigns that promote a brand's products, services, or identity. This includes developing the creative concept, producing the content, and placing it across the right channels — digital, social, broadcast, and outdoor.",
  },
  {
    q: "What types of advertising does Astroshot create?",
    a: "Astroshot creates digital advertising campaigns, social media ads, VFX and CGI brand commercials, product launch campaigns, and full 360 campaign rollouts. We handle creative production and paid media strategy under one roof.",
  },
  {
    q: "How much does advertising cost in Kuwait?",
    a: "Advertising investment in Kuwait depends on the campaign scope, number of deliverables, media budget, and production complexity. Astroshot works with brands at different investment levels — from focused digital campaigns to full multi-platform brand campaigns.",
  },
  {
    q: "Does Astroshot manage paid advertising budgets?",
    a: "Yes. Astroshot manages paid social advertising on Instagram, TikTok, Snapchat, and other platforms — including campaign setup, audience targeting, creative testing, and ongoing optimization.",
  },
  {
    q: "Does Astroshot create Ramadan campaigns?",
    a: "Yes. Ramadan is one of the highest-impact campaign periods in Kuwait and the GCC. Astroshot produces Ramadan campaign content — both creative production and digital campaign management — specifically designed for the Ramadan audience and cultural context.",
  },
  {
    q: "Can Astroshot handle a full campaign from concept to launch?",
    a: "Yes. Astroshot provides end-to-end campaign management — from strategic brief and creative concept through production, content delivery, and paid media execution. You get one agency that owns the whole campaign.",
  },
];

export default function AdvertisingAgencyKuwaitPage() {
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
            Advertising
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Advertising Agency in Kuwait That Makes Campaigns People Remember
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates high-impact advertising campaigns for brands in Kuwait and the GCC — combining VFX production, sharp creative direction, and digital media expertise to deliver campaigns that perform.
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
              Start a Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">

        {/* Stats */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {results.map((item) => (
            <div key={item.label} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 text-center">
              <div className="text-3xl lg:text-4xl font-extrabold text-[#01F17C]">{item.stat}</div>
              <div className="mt-2 text-xs text-white/60 uppercase tracking-wider">{item.label}</div>
            </div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              What We Do
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot builds advertising campaigns that are designed to perform — from the creative concept and production through to digital media placement and optimization. We work across social media advertising, VFX brand commercials, product launches, and full 360 campaign rollouts for brands in Kuwait and the GCC.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              Advertising Services
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

        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Campaign Types
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignTypes.map((item) => (
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
            Ready to run a campaign your market can&apos;t ignore?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build a campaign strategy and creative plan that delivers real results.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Start a Campaign
          </Link>
        </div>
      </section>
    </div>
  );
}
