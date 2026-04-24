import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Digital Marketing Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a leading digital marketing agency in Kuwait. We combine paid media, social media, content creation, and creative production to grow brands across Kuwait and the GCC.",
  keywords: [
    "digital marketing agency Kuwait",
    "digital marketing Kuwait",
    "online marketing Kuwait",
    "paid media Kuwait",
    "performance marketing Kuwait",
    "digital agency Kuwait",
    "marketing company Kuwait",
  ],
};

const services = [
  "Paid social media advertising",
  "Google and search advertising",
  "Social media management",
  "Content creation and production",
  "Campaign strategy and planning",
  "Analytics and performance reporting",
  "Email and CRM marketing",
];

const channels = [
  "Instagram Ads",
  "TikTok Ads",
  "Snapchat Ads",
  "Google Ads",
  "YouTube Ads",
  "LinkedIn Ads",
];

const results = [
  { stat: "500M+", label: "Organic views" },
  { stat: "170+", label: "Campaigns delivered" },
  { stat: "Kuwait", label: "Market specialists" },
  { stat: "GCC", label: "Regional reach" },
];

const faqs = [
  {
    q: "What is a digital marketing agency?",
    a: "A digital marketing agency helps brands grow online through paid advertising, social media, content, SEO, and digital campaign strategy. Astroshot combines creative production with digital marketing execution — so campaigns are both strategically sound and visually premium.",
  },
  {
    q: "What digital marketing services does Astroshot offer?",
    a: "Astroshot offers paid social media advertising, Google advertising, social media management, content creation, campaign strategy, and performance reporting — all under one roof.",
  },
  {
    q: "How much does digital marketing cost in Kuwait?",
    a: "Digital marketing investment varies based on channels, campaign objectives, and media budget. For paid advertising, Astroshot charges a service fee on top of the media spend. For budgets above 2,000 KWD per month, the service fee is 15%. For smaller budgets, a fixed fee applies.",
  },
  {
    q: "Does Astroshot manage Google Ads in Kuwait?",
    a: "Yes. Astroshot manages Google Search, Display, and YouTube advertising campaigns for brands in Kuwait and the GCC — including keyword strategy, ad creation, targeting, and ongoing optimization.",
  },
  {
    q: "How long does it take to see results from digital marketing?",
    a: "Paid advertising can drive immediate results from day one. Organic growth through social media and content typically takes 2-3 months to build real momentum. Astroshot provides monthly reporting so you can track progress clearly.",
  },
  {
    q: "Does Astroshot handle both creative production and media buying?",
    a: "Yes. Astroshot provides both — creative production (the ads and content) and media buying (placing and optimizing the campaigns). Having both under one roof means faster execution and stronger creative-media alignment.",
  },
];

export default function DigitalMarketingKuwaitPage() {
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
            Digital Marketing
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Digital Marketing Agency in Kuwait That Drives Real Growth
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot combines premium creative production with paid media strategy to grow brands in Kuwait and the GCC — more reach, more engagement, more business.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors">
              View Our Work
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
              Get a Proposal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">

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
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot provides full-service digital marketing for brands in Kuwait and the GCC — combining paid media management with premium creative production. We don't just run ads — we build campaigns that are strategically sharp and visually strong enough to actually perform.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Digital Marketing Services</h3>
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
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Channels We Manage</h2>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {channels.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-5 text-sm text-white/85 text-center">{item}</div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Frequently Asked Questions</h2>
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
            Ready to grow your brand in Kuwait&apos;s digital market?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build a digital marketing strategy that delivers real, measurable results.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Get a Proposal
          </Link>
        </div>
      </section>
    </div>
  );
}
