import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "National Day Campaign Agency in Kuwait | Astroshot",
  description:
    "Astroshot creates premium Kuwait National Day campaigns for brands. VFX films, social media content, and full campaign packages for February 25-26 that connect brands with Kuwait's proudest moment.",
  keywords: [
    "National Day campaign Kuwait",
    "Kuwait National Day marketing",
    "National Day advertising Kuwait",
    "Liberation Day campaign Kuwait",
    "February 25 Kuwait campaign",
    "Kuwait National Day content",
    "National Day agency Kuwait",
  ],
};

const services = [
  "National Day campaign strategy",
  "VFX and CGI National Day films",
  "Social media National Day content packages",
  "Arabic copywriting and creative direction",
  "National Day photography and video",
  "Digital advertising for National Day",
  "Full content calendars for the season",
];

const whyNationalDay = [
  {
    title: "Kuwait's most emotionally charged moment",
    desc: "National Day (February 25) and Liberation Day (February 26) are the highest-sentiment days in the Kuwait calendar. Brands that show up authentically during this period build deep emotional connections with Kuwaiti audiences.",
  },
  {
    title: "Massive spike in social media activity",
    desc: "Social media engagement in Kuwait surges around National Day. Brands with premium, patriotic content capture enormous organic reach during this window.",
  },
  {
    title: "Authenticity wins",
    desc: "Kuwaiti audiences can immediately tell the difference between brands that truly understand National Day sentiment and those posting generic content. Astroshot creates campaigns that feel genuine and culturally right.",
  },
  {
    title: "Plan 4-6 weeks ahead",
    desc: "National Day production — especially VFX or CGI films — needs to start 4-6 weeks before February 25. Brands that plan early produce the best campaigns.",
  },
];

const contentTypes = [
  "National Day brand films",
  "Countdown social media content",
  "Arabic patriotic creative",
  "Kuwait flag and heritage visuals",
  "National Day offers and promotions",
  "Liberation Day follow-up content",
];

const faqs = [
  {
    q: "Why should brands invest in Kuwait National Day campaigns?",
    a: "National Day is the most emotionally significant moment in the Kuwait calendar. Brands that show up with premium, authentic content during February 25-26 build lasting emotional connections with Kuwaiti audiences — and stand out from the generic posts that flood the feed every year.",
  },
  {
    q: "When should we start planning a National Day campaign?",
    a: "Ideally 4-6 weeks before February 25. For VFX or CGI production, even earlier is better. The best National Day campaigns are planned in January — brands that start in February are already behind.",
  },
  {
    q: "Does Astroshot create National Day content in Arabic?",
    a: "Yes. Astroshot creates National Day content in Kuwaiti Arabic — not generic Gulf Arabic. The tone, the expressions, and the cultural nuance matter enormously for National Day content, and Astroshot gets this right.",
  },
  {
    q: "Does Astroshot produce VFX National Day films?",
    a: "Yes. Astroshot has produced VFX and CGI National Day content for brands in Kuwait. A cinematic National Day film with strong Kuwaiti visual identity consistently outperforms standard content during this period.",
  },
  {
    q: "What makes a great Kuwait National Day campaign?",
    a: "The best National Day campaigns combine genuine patriotic sentiment with premium production — they feel like a tribute, not a promotion. They use Kuwaiti visual language, authentic Arabic copy, and cinematic quality that matches the emotional weight of the occasion.",
  },
  {
    q: "Does Astroshot also create Liberation Day content?",
    a: "Yes. Astroshot plans and produces content for both National Day (February 25) and Liberation Day (February 26) as part of a complete national season campaign.",
  },
];

export default function NationalDayCampaignKuwaitPage() {
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
            National Day Campaigns
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            National Day Campaign Agency in Kuwait for Brands That Show Up Right
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates premium Kuwait National Day campaigns — VFX films, social media content, and full campaign packages that connect brands with Kuwait's proudest moment on February 25-26.
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
              Astroshot creates complete National Day campaign packages for brands in Kuwait — from creative concept and VFX production through to social media content and digital advertising around February 25-26. We build campaigns that feel genuine, look premium, and capture the pride and spirit of Kuwait's National Day in a way that makes brands part of the moment.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">National Day Services</h3>
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
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Why National Day Campaigns Matter</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyNationalDay.map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6">
                <h3 className="text-base font-bold text-[#01F17C]">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Content We Produce</h2>
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
            Don&apos;t let National Day pass without a campaign worth remembering.
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Start planning now — the best campaigns are built well before February 25.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Plan Your Campaign
          </Link>
        </div>
      </section>
    </div>
  );
}
