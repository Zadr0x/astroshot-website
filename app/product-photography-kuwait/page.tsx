import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Product Photography in Kuwait | Astroshot",
  description:
    "Astroshot provides premium product photography in Kuwait. We shoot commercial product photos, lifestyle images, and e-commerce content for brands across Kuwait and the GCC.",
  keywords: [
    "product photography Kuwait",
    "commercial photography Kuwait",
    "product shoot Kuwait",
    "e-commerce photography Kuwait",
    "brand photography Kuwait",
    "photography studio Kuwait",
    "lifestyle photography Kuwait",
  ],
};

const services = [
  "Studio product photography",
  "Lifestyle and on-location shoots",
  "E-commerce product photos",
  "Food and beverage photography",
  "Fashion and apparel photography",
  "Automotive and vehicle photography",
  "Corporate and brand photography",
];

const deliverables = [
  "High-resolution edited images",
  "Web-optimised versions",
  "Social media crops (1:1, 4:5, 9:16)",
  "White background e-commerce shots",
  "Lifestyle and contextual images",
  "RAW files on request",
];

const faqs = [
  {
    q: "Why does product photography matter for my brand?",
    a: "Premium product photography directly impacts how customers perceive your brand and whether they choose to buy. In Kuwait's competitive market, brands that invest in professional photography consistently outperform those using low-quality visuals — especially on Instagram and e-commerce platforms.",
  },
  {
    q: "What types of product photography does Astroshot offer?",
    a: "Astroshot offers studio product photography, lifestyle shoots, e-commerce photos, food and beverage photography, fashion photography, and automotive photography — tailored to the brand's needs and target audience.",
  },
  {
    q: "Does Astroshot have a studio in Kuwait?",
    a: "Yes. Astroshot operates in Kuwait with in-house photography capability for studio shoots and on-location production across Kuwait and the GCC.",
  },
  {
    q: "How many photos are delivered per shoot?",
    a: "The number of final images depends on the shoot scope and package. Astroshot agrees on deliverables before every shoot — typically ranging from 20-50 edited images for standard product packages, more for larger campaigns.",
  },
  {
    q: "How long does a product photography shoot take?",
    a: "A standard product photography session typically takes half a day to a full day depending on the number of products and setups. Delivery of final edited images is usually within 3-7 working days.",
  },
  {
    q: "Does Astroshot shoot for social media formats?",
    a: "Yes. All Astroshot photography is delivered in the formats needed — including square 1:1, portrait 4:5, and vertical 9:16 for Instagram, TikTok, and social media use.",
  },
];

export default function ProductPhotographyKuwaitPage() {
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
            Photography
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Product Photography in Kuwait That Makes Brands Look Premium
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot produces commercial product photography for brands in Kuwait and the GCC — studio shots, lifestyle images, and e-commerce content that makes products look exactly as good as they deserve to.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors">
              View Our Work
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
              Book a Shoot
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot produces premium product and commercial photography that makes brands look their best — whether for Instagram, e-commerce, advertising, or brand assets. Every shoot is planned with creative direction, styled professionally, and delivered fully edited and ready to use.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Photography Services</h3>
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
          <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What You Receive</h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliverables.map((item) => (
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
            Ready to show your product at its best?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s plan a shoot that makes your brand impossible to scroll past.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Book a Shoot
          </Link>
        </div>
      </section>
    </div>
  );
}
