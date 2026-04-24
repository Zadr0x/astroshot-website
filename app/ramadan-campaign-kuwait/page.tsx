import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ramadan Campaign Agency in Kuwait | Astroshot",
  description:
    "Astroshot creates premium Ramadan campaigns for brands in Kuwait and the GCC. VFX videos, social media content, and full Ramadan campaign packages that capture the spirit of the season.",
  keywords: [
    "Ramadan campaign Kuwait",
    "Ramadan marketing Kuwait",
    "Ramadan advertising Kuwait",
    "Ramadan content Kuwait",
    "Ramadan social media Kuwait",
    "Ramadan video Kuwait",
    "Ramadan agency Kuwait",
  ],
};

const services = [
  "Ramadan campaign strategy",
  "VFX and CGI Ramadan films",
  "Social media Ramadan content packages",
  "Ramadan photography and video production",
  "Ramadan digital advertising",
  "Arabic copywriting and captions",
  "Full Ramadan content calendars",
];

const whyRamadan = [
  {
    title: "Highest engagement period of the year",
    desc: "Ramadan drives more social media engagement than any other time of year in Kuwait and the GCC. Brands that show up with premium content during Ramadan build lasting emotional connections.",
  },
  {
    title: "Audience is highly active and receptive",
    desc: "During Ramadan, audiences in Kuwait and the GCC spend significantly more time on social media — making it the most valuable campaign window of the calendar year.",
  },
  {
    title: "Premium content stands out",
    desc: "Most brands produce generic Ramadan posts. Brands that invest in cinematic VFX, thoughtful creative, and culturally resonant content dominate the conversation.",
  },
  {
    title: "Plan early, win big",
    desc: "The best Ramadan campaigns are planned 6-8 weeks in advance. Astroshot works with brands ahead of the season to ensure production is complete and content is ready to launch on day one.",
  },
];

const contentTypes = [
  "Ramadan brand films (15-60 seconds)",
  "Daily Ramadan countdown posts",
  "Iftar and Suhoor themed content",
  "Ramadan offers and promotions",
  "Ramadan TikTok series",
  "National Day tie-in content",
];

const faqs = [
  {
    q: "When should we start planning a Ramadan campaign?",
    a: "Ideally 6-8 weeks before Ramadan begins. Production of VFX or CGI content takes time — and the brands that win Ramadan are the ones with content ready to launch on day one, not scrambling to produce it during the month itself.",
  },
  {
    q: "What type of Ramadan content performs best in Kuwait?",
    a: "In Kuwait, Ramadan content that combines emotional storytelling with premium visual production consistently outperforms generic posts. VFX films, cinematic brand videos, and culturally resonant Arabic creative all perform strongly. Short-form video (15-30 seconds) dominates on Instagram and TikTok.",
  },
  {
    q: "Does Astroshot create Ramadan content in Arabic?",
    a: "Yes. Astroshot produces Ramadan content in Arabic and English — including Arabic copywriting, captions, voiceover scripts, and bilingual campaign assets designed specifically for Kuwaiti and GCC audiences.",
  },
  {
    q: "Can Astroshot manage our entire Ramadan social media presence?",
    a: "Yes. Astroshot can manage your brand's complete Ramadan social media presence — strategy, content production, daily posting, community management, and paid advertising throughout the month.",
  },
  {
    q: "Does Astroshot create VFX content for Ramadan?",
    a: "Yes. Astroshot has produced VFX and CGI Ramadan films for major brands in Kuwait. Cinematic VFX content is one of the most effective formats for Ramadan brand campaigns — it creates the visual impact and emotional depth the season calls for.",
  },
  {
    q: "How much does a Ramadan campaign cost?",
    a: "Ramadan campaign investment depends on scope — from focused social media content packages to full VFX production campaigns. Astroshot works with brands at different budget levels to build the best possible Ramadan presence within their investment.",
  },
];

export default function RamadanCampaignKuwaitPage() {
  return (
    <div className="min-h-screen bg-[#050505] pt-24">
      <div className="relative overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 10% 20%, rgba(1,241,124,0.08), transparent 55%)",
          }}
        />
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            Ramadan Campaigns
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Ramadan Campaign Agency in Kuwait for Brands That Mean It
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates premium Ramadan campaigns for brands in Kuwait and the GCC — VFX films, social media content, and full campaign packages that capture the spirit of the season and connect with audiences at the highest moment of the year.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors">
              View Our Work
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
              Plan Your Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot builds complete Ramadan campaign packages for brands in Kuwait and the GCC — from creative strategy and VFX production through to social media management and digital advertising throughout the month. We plan early, produce at the highest level, and deliver campaigns that make brands genuinely stand out during the most important marketing period of the year.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Ramadan Services</h3>
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
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Why Ramadan Campaigns Matter</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyRamadan.map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6">
                <h3 className="text-base font-bold text-[#01F17C]">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Content Types We Produce</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentTypes.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 text-sm text-white/90">{item}</div>
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
            Don&apos;t leave Ramadan to the last minute.
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            The best Ramadan campaigns are planned early. Let&apos;s start building yours now.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Plan Your Campaign
          </Link>
        </div>
      </section>
    </div>
  );
}
