import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Automotive Marketing Agency in Kuwait | Astroshot",
  description:
    "Astroshot is Kuwait's leading automotive marketing agency. We produce VFX commercials, CGI campaigns, social media content, and launch films for automotive brands across Kuwait and the GCC.",
  keywords: [
    "automotive marketing Kuwait",
    "car marketing Kuwait",
    "automotive advertising Kuwait",
    "automotive agency Kuwait",
    "car launch Kuwait",
    "automotive CGI Kuwait",
    "automotive social media Kuwait",
  ],
};

const services = [
  "Automotive VFX and CGI commercials",
  "Car launch films and reveal campaigns",
  "Automotive social media management",
  "3D product visualization and animation",
  "Dealer and showroom campaign content",
  "Automotive photography and video",
  "Digital advertising for automotive brands",
];

const clients = [
  "Mercedes-Benz",
  "BMW",
  "Honda",
  "BYD",
  "Hongqi Alghanim",
  "Chevrolet",
  "Cadillac",
  "Ford",
  "MG",
];

const campaignTypes = [
  "New model launch campaigns",
  "Seasonal offers and promotions",
  "Showroom traffic campaigns",
  "Test drive lead generation",
  "Brand awareness and positioning",
  "Social media content series",
];

const faqs = [
  {
    q: "Why does automotive marketing in Kuwait need a specialist agency?",
    a: "Automotive is one of the most competitive advertising categories in Kuwait. Brands like Mercedes, BMW, Honda, and BYD compete aggressively for attention — and the content quality bar is extremely high. Generic agencies produce generic results. Astroshot understands automotive visual language, launch timing, and what drives showroom traffic in the Kuwait market.",
  },
  {
    q: "Does Astroshot create CGI campaigns for automotive brands?",
    a: "Yes. Astroshot has produced CGI and VFX campaigns for major automotive brands in Kuwait — including Mercedes-Benz, BMW, Honda, BYD, and Hongqi. We create everything from short social media VFX videos to full launch films.",
  },
  {
    q: "What automotive content performs best in Kuwait?",
    a: "In Kuwait, automotive content that combines cinematic VFX or CGI with strong social-first pacing consistently outperforms traditional footage. Short-form video (15-30 seconds) on Instagram and TikTok drives the most engagement. Astroshot specialises in this format.",
  },
  {
    q: "Can Astroshot manage social media for an automotive dealership?",
    a: "Yes. Astroshot manages social media accounts for automotive brands and dealerships in Kuwait — including content strategy, production, publishing, and paid advertising.",
  },
  {
    q: "Does Astroshot produce content for car launches?",
    a: "Yes. Astroshot has produced launch campaign content for multiple automotive brands in Kuwait — including teaser films, reveal content, showroom activation visuals, and social media campaign packages.",
  },
  {
    q: "Does Astroshot work with GCC automotive brands outside Kuwait?",
    a: "Yes. Astroshot works with automotive brands across Kuwait, Saudi Arabia, and the UAE — with deep understanding of GCC automotive culture, audience expectations, and platform behaviour.",
  },
];

export default function AutomotiveMarketingKuwaitPage() {
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
            Automotive Marketing
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Automotive Marketing Agency in Kuwait for Brands That Move
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot creates VFX commercials, CGI launch films, and social media campaigns for automotive brands in Kuwait and the GCC — cinematic quality built for the competitive Gulf automotive market.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors">
              View Our Work
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
              Start a Campaign
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">

        {/* Services */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot produces automotive marketing content that matches the visual ambition of the brands we work with. From CGI launch films and VFX commercials to social media management and paid advertising — we handle the full spectrum of automotive brand marketing in Kuwait and the GCC.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Automotive Services</h3>
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

        {/* Clients */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Automotive Brands We've Worked With</h2>
          <p className="mt-4 text-white/60 text-base">Astroshot has produced campaigns for some of the most recognised automotive brands in Kuwait and the GCC.</p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {clients.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-5 text-sm text-white/85 text-center">{item}</div>
            ))}
          </div>
        </section>

        {/* Campaign Types */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Campaign Types</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaignTypes.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 text-sm text-white/90">{item}</div>
            ))}
          </div>
        </section>

        {/* FAQ */}
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
            Ready to launch your next automotive campaign?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build a campaign that does justice to the brand you represent.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Start a Campaign
          </Link>
        </div>
      </section>
    </div>
  );
}
