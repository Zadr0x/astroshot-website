import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Instagram Management Agency in Kuwait | Astroshot",
  description:
    "Astroshot manages Instagram accounts for brands in Kuwait and the GCC. Premium content creation, strategy, and account growth — built for brands that want to win on Instagram.",
  keywords: [
    "Instagram management Kuwait",
    "Instagram agency Kuwait",
    "Instagram marketing Kuwait",
    "Instagram content Kuwait",
    "Instagram growth Kuwait",
    "Instagram for business Kuwait",
    "Instagram manager Kuwait",
  ],
};

const services = [
  "Instagram account strategy and audit",
  "Feed design and aesthetic planning",
  "Content creation (photo, video, Reels)",
  "Caption writing and hashtag strategy",
  "Stories and highlights management",
  "Community management and DMs",
  "Instagram ads management",
  "Monthly analytics and reporting",
];

const packages = [
  {
    name: "Earth",
    desc: "For growing brands that need a consistent, professional Instagram presence.",
    best: false,
  },
  {
    name: "Moon",
    desc: "For established brands ready to grow with premium content and active community management.",
    best: true,
  },
  {
    name: "Big Bang",
    desc: "For ambitious brands that want maximum output, reach, and Instagram dominance.",
    best: false,
  },
];

const whyInstagram = [
  "Kuwait has one of the highest Instagram penetration rates globally",
  "Instagram is the primary discovery platform for Kuwait consumers",
  "Brands with consistent, premium feeds build trust and drive purchases",
  "Reels reach far beyond existing followers — organic growth is still real",
  "Instagram DMs are where Kuwait clients actually close business",
];

const faqs = [
  {
    q: "Why does Instagram management matter for Kuwait brands?",
    a: "Kuwait has one of the highest Instagram usage rates in the world. For most Kuwait brands, Instagram is the primary way new customers discover them — making a consistent, premium Instagram presence one of the highest-ROI marketing investments a brand can make.",
  },
  {
    q: "What does Astroshot's Instagram management include?",
    a: "Astroshot handles everything — strategy, content creation (photo, video, Reels, Stories), caption writing, publishing, community management, and monthly performance reporting. You get a complete Instagram system, not just posting.",
  },
  {
    q: "How many posts per month does Astroshot produce?",
    a: "Posting frequency depends on the package selected. Astroshot offers packages ranging from focused monthly content to high-frequency posting with daily Stories and multiple Reels per week.",
  },
  {
    q: "Does Astroshot create Reels for Instagram?",
    a: "Yes. Instagram Reels are the highest-reach format on the platform right now. Astroshot produces Reels specifically designed for the Kuwait and GCC audience — with the right pacing, music, and creative approach to maximize organic reach.",
  },
  {
    q: "Does Astroshot manage Instagram in Arabic?",
    a: "Yes. Astroshot produces bilingual Instagram content in Arabic and English — with native-level Kuwaiti Arabic copywriting that resonates with local audiences, not generic Gulf Arabic.",
  },
  {
    q: "How long before we see Instagram growth?",
    a: "Meaningful, sustainable Instagram growth typically takes 2-3 months of consistent premium content. The first month builds the content system and creative direction. Growth compounds from there with continued consistency.",
  },
];

export default function InstagramManagementKuwaitPage() {
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
            Instagram Management
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Instagram Management Agency in Kuwait That Grows Real Brands
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot manages Instagram for brands in Kuwait and the GCC — premium content, smart strategy, and consistent execution that builds an Instagram presence your competitors can't ignore.
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

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot manages Instagram accounts end-to-end for brands in Kuwait and the GCC. We handle strategy, content production, publishing, community management, and performance tracking — delivering a complete Instagram presence that grows your audience, builds your brand, and drives real business results every month.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Instagram Services</h3>
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
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Instagram Packages</h2>
          <p className="mt-4 text-white/60 text-base">Choose the package that fits your brand's growth ambition.</p>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
            {packages.map((pkg) => (
              <div key={pkg.name} className={`rounded-2xl border p-8 ${pkg.best ? "border-[#01F17C] bg-[#01F17C]/5" : "border-white/10 bg-[#0d0d0d]"}`}>
                {pkg.best && (
                  <span className="text-xs font-bold uppercase tracking-widest text-[#01F17C] block mb-3">Recommended</span>
                )}
                <h3 className="text-2xl font-extrabold text-white">{pkg.name}</h3>
                <p className="mt-3 text-white/60 text-sm leading-relaxed">{pkg.desc}</p>
                <Link href="/contact" className={`mt-6 inline-flex items-center justify-center w-full px-6 py-3 text-sm font-bold rounded-xl transition-colors ${pkg.best ? "bg-[#01F17C] text-[#050505] hover:bg-[#00d96e]" : "border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C]"}`}>
                  Get Started
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Why Instagram */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Why Instagram in Kuwait</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {whyInstagram.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6 text-sm text-white/85">{item}</div>
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
            Ready to build an Instagram that actually represents your brand?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s put together an Instagram strategy and content plan that grows your brand the right way.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Get a Proposal
          </Link>
        </div>
      </section>
    </div>
  );
}
