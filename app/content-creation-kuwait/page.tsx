import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Content Creation Agency in Kuwait | Astroshot",
  description:
    "Astroshot is a leading content creation agency in Kuwait. We produce photography, video, graphic design, and social media content for brands across Kuwait and the GCC.",
  keywords: [
    "content creation Kuwait",
    "content agency Kuwait",
    "social media content Kuwait",
    "content production Kuwait",
    "brand content Kuwait",
    "content creator Kuwait",
    "digital content GCC",
  ],
};

const services = [
  "Photography and product shoots",
  "Video content production",
  "Graphic design and visual content",
  "Copywriting and captions",
  "Instagram and TikTok content",
  "Branded storytelling content",
  "Monthly content calendars",
];

const contentTypes = [
  "Social media feed posts",
  "Instagram Reels and Stories",
  "TikTok videos",
  "Product photography",
  "Behind-the-scenes content",
  "Campaign content packages",
];

const faqs = [
  {
    q: "What is a content creation agency?",
    a: "A content creation agency produces the visual and written content brands need to show up consistently and professionally across social media, digital advertising, and their website. This includes photography, video, design, copywriting, and full content packages.",
  },
  {
    q: "How much does content creation cost in Kuwait?",
    a: "Content creation pricing depends on the volume, format, and complexity of what is needed. Astroshot offers monthly content packages tailored to different brand sizes and budgets — from focused social media content to full campaign productions.",
  },
  {
    q: "Does Astroshot provide content for both Instagram and TikTok?",
    a: "Yes. Astroshot creates content specifically optimised for Instagram (feed, Reels, Stories) and TikTok — with format, aspect ratio, and creative approach adapted per platform.",
  },
  {
    q: "Can Astroshot handle content creation for a product launch?",
    a: "Yes. Astroshot produces full content packages for product launches — including photography, video, social media content, and campaign assets across all required formats and platforms.",
  },
  {
    q: "Does Astroshot write captions and copy as well as produce visuals?",
    a: "Yes. Astroshot provides full content creation including copywriting, captions, and Arabic/English bilingual content — not just visual production.",
  },
  {
    q: "How quickly can Astroshot deliver content?",
    a: "Standard monthly content packages are delivered on an agreed schedule. Rush content is available depending on current capacity — contact Astroshot to discuss your timeline.",
  },
];

export default function ContentCreationKuwaitPage() {
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
            Content Creation
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Content Creation Agency in Kuwait for Brands That Show Up
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot produces premium content for brands in Kuwait and the GCC — photography, video, design, and copy — built for the platforms your audience actually uses.
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
              Astroshot creates the content brands need to show up consistently and professionally — across Instagram, TikTok, and digital advertising. From photography and video to graphic design and copywriting, we build content systems that are premium, on-brand, and built to perform every month.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Content Services</h3>
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
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Content Types</h2>
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
            Ready for content that actually represents your brand?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build a content system that keeps your brand showing up at its best.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Get a Proposal
          </Link>
        </div>
      </section>
    </div>
  );
}
