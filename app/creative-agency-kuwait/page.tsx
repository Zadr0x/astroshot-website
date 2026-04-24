import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Creative Agency in Kuwait | Astroshot",
  description:
    "Astroshot is Kuwait's leading creative agency. We combine VFX, CGI, social media, branding, and video production to create premium campaigns that make brands impossible to ignore.",
  keywords: [
    "creative agency Kuwait",
    "advertising agency Kuwait",
    "marketing agency Kuwait",
    "creative production Kuwait",
    "brand campaign Kuwait",
    "digital agency Kuwait",
    "creative studio GCC",
  ],
};

const services = [
  "VFX and CGI production",
  "Brand identity and visual systems",
  "Social media management",
  "Commercial video production",
  "3D animation and visualization",
  "Digital campaign strategy",
  "Content creation and copywriting",
];

const clients = [
  "Mercedes-Benz",
  "Gulf Bank",
  "Honda",
  "BMW",
  "NBK",
  "Virgin Mobile",
  "IKEA",
  "Huawei",
  "BYD",
  "Costa Coffee",
  "Jahez",
  "Trolley",
];

const whyUs = [
  {
    title: "500M+ organic views",
    desc: "Content we've created has generated over 500 million organic views for brands across Kuwait and the GCC.",
  },
  {
    title: "VFX + creative under one roof",
    desc: "We combine premium VFX and 3D capability with sharp creative direction — something most agencies in Kuwait cannot offer.",
  },
  {
    title: "Kuwait and GCC market knowledge",
    desc: "We understand what works in Kuwait and the Gulf — culturally, creatively, and commercially.",
  },
  {
    title: "Premium at every level",
    desc: "From concept to delivery, the standard is always premium. We don't produce average work.",
  },
];

const faqs = [
  {
    q: "What is a creative agency?",
    a: "A creative agency provides strategic and creative services to help brands communicate, grow, and stand out. This includes brand identity, advertising campaigns, content creation, social media, video production, and digital marketing — all grounded in creative thinking and execution.",
  },
  {
    q: "What makes Astroshot different from other agencies in Kuwait?",
    a: "Astroshot combines VFX, CGI, 3D animation, and premium creative production in a way that most Kuwait agencies cannot. We produce work that is genuinely cinematic and commercially sharp — built for the standards brands like Mercedes, Gulf Bank, and Honda expect.",
  },
  {
    q: "What services does Astroshot offer?",
    a: "Astroshot offers VFX production, CGI campaigns, 3D animation, social media management, branding, commercial video production, and full digital campaign strategy — all under one roof.",
  },
  {
    q: "Does Astroshot work with large corporate clients?",
    a: "Yes. Astroshot has worked with major brands including Mercedes-Benz, Gulf Bank, Honda, BMW, NBK, Virgin Mobile, IKEA, and more across Kuwait, Saudi Arabia, and the UAE.",
  },
  {
    q: "How does Astroshot approach a new project?",
    a: "Every project starts with understanding the brand, the objective, and the audience. From there, Astroshot develops a creative strategy and production approach that is designed to achieve a specific outcome — not just produce content for the sake of it.",
  },
  {
    q: "Can Astroshot handle both strategy and production?",
    a: "Yes. Astroshot provides end-to-end service from creative strategy through to final production and delivery. You get one team, one vision, and one standard of quality across everything.",
  },
];

export default function CreativeAgencyKuwaitPage() {
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
            Creative Agency
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Kuwait&apos;s Creative Agency for Brands That Refuse to Be Ignored
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot is Kuwait's leading creative agency — combining VFX, CGI, social media, branding, and video production to create campaigns that turn heads, drive engagement, and build brands that last.
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
              Work With Us
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">

        {/* Services */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              What We Do
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot is a full-service creative agency covering everything brands need to stand out — from VFX and CGI production to social media management, branding, and commercial video. Every service is built around one goal: making your brand impossible to ignore in Kuwait and across the GCC.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">
              Our Services
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

        {/* Why Us */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Why Astroshot
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {whyUs.map((item) => (
              <div key={item.title} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6">
                <h3 className="text-base font-bold text-[#01F17C]">{item.title}</h3>
                <p className="mt-2 text-sm text-white/70 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Clients */}
        <section>
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            Brands We&apos;ve Worked With
          </h2>
          <p className="mt-4 text-white/60 text-base">
            Astroshot has produced campaigns for some of the most recognised brands in Kuwait and the GCC.
          </p>
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {clients.map((item) => (
              <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-5 text-sm text-white/85 text-center">
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
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
            Let&apos;s build something your competitors can&apos;t match.
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Tell us what you&apos;re working on and we&apos;ll tell you exactly how we can help.
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
          >
            Work With Us
          </Link>
        </div>
      </section>
    </div>
  );
}
