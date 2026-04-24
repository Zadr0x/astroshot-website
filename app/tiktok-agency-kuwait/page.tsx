import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "TikTok Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a leading TikTok agency in Kuwait. We create TikTok content strategies, produce high-performing videos, and manage TikTok accounts for brands across Kuwait and the GCC.",
  keywords: [
    "TikTok agency Kuwait",
    "TikTok marketing Kuwait",
    "TikTok management Kuwait",
    "TikTok content Kuwait",
    "TikTok production Kuwait",
    "TikTok brand Kuwait",
    "TikTok GCC",
  ],
};

const services = [
  "TikTok account strategy and setup",
  "Content planning and scripting",
  "Video production and editing",
  "Trend-led content creation",
  "Publishing and scheduling",
  "TikTok ads and paid promotion",
  "Monthly performance reporting",
];

const packages = [
  { name: "Lift Off", videos: "5 videos/month", best: false },
  { name: "Orbit", videos: "10 videos/month", best: true },
  { name: "Galaxy", videos: "15 videos/month", best: false },
];

const whyTikTok = [
  "Highest organic reach of any platform right now",
  "Kuwait and GCC audiences are highly active",
  "Algorithm rewards creative quality over follower count",
  "Fastest path to viral brand moments",
  "Drives real business results — traffic, leads, sales",
];

const faqs = [
  {
    q: "Why does my brand need a TikTok strategy?",
    a: "TikTok has the highest organic reach of any social platform right now. Brands that show up consistently with quality content are getting millions of views without paid spend. In Kuwait and the GCC, TikTok adoption is growing fast — and the brands getting in early are building massive advantages.",
  },
  {
    q: "What does Astroshot's TikTok service include?",
    a: "Astroshot handles everything — strategy, scripting, filming, editing, publishing, and reporting. You get a complete TikTok content system built specifically for your brand and audience.",
  },
  {
    q: "How many TikTok videos should a brand post per month?",
    a: "Consistency matters more than volume. Astroshot recommends a minimum of 5 videos per month to build momentum. For brands that want to grow aggressively, 10-15 videos per month produces significantly stronger results.",
  },
  {
    q: "Does Astroshot create TikTok content in Arabic?",
    a: "Yes. Astroshot creates TikTok content in both Arabic and English depending on the brand's target audience. We understand Kuwaiti Arabic tone, dialect preferences, and what resonates with Gulf audiences specifically.",
  },
  {
    q: "How much does TikTok management cost in Kuwait?",
    a: "TikTok management pricing depends on the number of videos, production complexity, and whether paid ads management is included. Astroshot offers tiered packages starting from 5 videos per month up to 15 videos per month.",
  },
  {
    q: "Can Astroshot run TikTok ads as well as organic content?",
    a: "Yes. Astroshot manages both organic TikTok content and paid TikTok advertising campaigns. Combining both is the most effective approach for brands that want fast growth and long-term presence.",
  },
];

export default function TiktokAgencyKuwaitPage() {
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
            TikTok Management
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            TikTok Agency in Kuwait That Builds Brands Through Content
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot manages TikTok for brands in Kuwait and the GCC — strategy, production, publishing, and growth. We build TikTok presences that generate real reach, real engagement, and real results.
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
              Astroshot builds and manages TikTok accounts for brands in Kuwait and the GCC from the ground up. We handle strategy, scripting, production, editing, and publishing — delivering consistent, high-quality TikTok content every month that is built to grow your audience and drive business results.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              TikTok Services Included
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

        {/* Packages */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            TikTok Packages
          </h2>
          <p className="mt-4 text-white/60 text-base">Choose the package that fits your growth goals.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`rounded-2xl border p-8 text-center ${
                  pkg.best
                    ? "border-[#01F17C] bg-[#01F17C]/5"
                    : "border-white/10 bg-[#0d0d0d]"
                }`}
              >
                {pkg.best && (
                  <span className="text-xs font-bold uppercase tracking-widest text-[#01F17C] block mb-3">
                    Recommended
                  </span>
                )}
                <h3 className="text-2xl font-extrabold text-white">{pkg.name}</h3>
                <p className="mt-3 text-white/60 text-sm">{pkg.videos}</p>
                <Link
                  href="/contact"
                  className={`mt-6 inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold rounded-xl transition-colors ${
                    pkg.best
                      ? "bg-[#01F17C] text-[#050505] hover:bg-[#00d96e]"
                      : "border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C]"
                  }`}
                >
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why TikTok */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Why TikTok Now
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyTikTok.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 text-sm text-white/85">
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
            Ready to build a TikTok presence that actually grows?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s put together a TikTok strategy and content plan built for your brand.
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
