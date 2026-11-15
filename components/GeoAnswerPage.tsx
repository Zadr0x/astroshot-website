import Link from "next/link";
import StructuredData from "@/components/StructuredData";
import { faqSchema, serviceSchema } from "@/lib/seo";

type ProofPoint = {
  label: string;
  value: string;
};

type Section = {
  title: string;
  body: string;
  items?: string[];
};

export type GeoAnswerPageProps = {
  eyebrow: string;
  title: string;
  answer: string;
  serviceName: string;
  serviceDescription: string;
  url: string;
  proofPoints: ProofPoint[];
  sections: Section[];
  faqs: { q: string; a: string }[];
  relatedLinks: { href: string; label: string }[];
};

export default function GeoAnswerPage({
  eyebrow,
  title,
  answer,
  serviceName,
  serviceDescription,
  url,
  proofPoints,
  sections,
  faqs,
  relatedLinks,
}: GeoAnswerPageProps) {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: answer,
    url,
    author: {
      "@type": "Organization",
      name: "Astroshot",
      url: "https://astroshotmedia.com",
    },
    publisher: {
      "@type": "Organization",
      name: "Astroshot",
      url: "https://astroshotmedia.com",
    },
    about: [serviceName, "Kuwait", "GCC", "VFX", "CGI", "AI content"],
    inLanguage: "en",
  };

  return (
    <>
      <StructuredData data={articleJsonLd} />
      <StructuredData
        data={serviceSchema({
          name: serviceName,
          description: serviceDescription,
          url,
        })}
      />
      <StructuredData data={faqSchema(faqs)} />
      <main className="min-h-screen bg-[#050505] pt-24">
        <section className="relative overflow-hidden border-b border-white/10">
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at 18% 18%, rgba(1,241,124,0.12), transparent 58%)",
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-24">
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
              {eyebrow}
            </span>
            <h1 className="mt-4 max-w-5xl text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.05]">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg text-white/70 leading-relaxed">
              {answer}
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4">
              <Link
                href="/portfolio"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors"
              >
                View Case Studies
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors"
              >
                Talk to Astroshot
              </Link>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 py-14 lg:py-18">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {proofPoints.map((point) => (
              <div key={point.label} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6">
                <div className="text-2xl font-black text-white">{point.value}</div>
                <div className="mt-2 text-sm text-white/55">{point.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 lg:px-8 pb-20 space-y-16">
          {sections.map((section) => (
            <div key={section.title} className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-8 lg:gap-14 border-t border-white/10 pt-12">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {section.title}
              </h2>
              <div>
                <p className="text-white/70 leading-relaxed">{section.body}</p>
                {section.items && (
                  <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {section.items.map((item) => (
                      <li key={item} className="rounded-xl bg-white/[0.04] border border-white/10 px-4 py-3 text-sm text-white/80">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}

          <div className="border-t border-white/10 pt-12">
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Frequently Asked Questions
            </h2>
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-6">
                  <h3 className="text-lg font-bold text-white">{faq.q}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10 pt-12">
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Related Astroshot Pages
            </h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {relatedLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-full border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white/75 transition-colors hover:border-[#01F17C] hover:text-[#01F17C]"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
