import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Corporate Video Production in Kuwait | Astroshot",
  description:
    "Astroshot produces premium corporate videos in Kuwait. Brand films, company profiles, testimonials, training videos, and corporate content for businesses across Kuwait and the GCC.",
  keywords: [
    "corporate video Kuwait",
    "corporate video production Kuwait",
    "company profile video Kuwait",
    "corporate film Kuwait",
    "business video Kuwait",
    "corporate content Kuwait",
    "brand film Kuwait",
  ],
};

const services = [
  "Company profile and brand films",
  "CEO and leadership interviews",
  "Testimonial and case study videos",
  "Corporate event highlight films",
  "Training and internal communication videos",
  "Investor and stakeholder presentations",
  "Annual report video summaries",
];

const industries = [
  "Banking and finance",
  "Oil and gas",
  "Government and public sector",
  "Healthcare",
  "Real estate and construction",
  "Retail and consumer goods",
  "Technology and telecom",
];

const whyCorporateVideo = [
  "Builds credibility and trust with clients and partners",
  "Communicates complex ideas clearly and quickly",
  "More engaging than written content alone",
  "Ideal for LinkedIn, websites, and presentations",
  "Strengthens employer brand for recruitment",
];

const faqs = [
  {
    q: "What types of corporate videos does Astroshot produce?",
    a: "Astroshot produces company profile films, brand stories, CEO interviews, testimonials, training videos, corporate event highlights, and investor presentations — everything a business needs to communicate professionally through video.",
  },
  {
    q: "How long should a corporate video be?",
    a: "It depends on the purpose. Company profile films typically run 2-3 minutes. Social media versions are cut to 60-90 seconds. CEO interviews and testimonials vary. Astroshot recommends the right length based on where the video will be used and who will watch it.",
  },
  {
    q: "Does Astroshot handle scripting for corporate videos?",
    a: "Yes. Astroshot provides full scripting, interview question development, and creative direction for corporate videos. You don't need to come with a script — we develop the narrative with you.",
  },
  {
    q: "How much does corporate video production cost in Kuwait?",
    a: "Corporate video pricing depends on the scope — single interview vs. full brand film, one location vs. multiple sites, simple editing vs. motion graphics integration. Astroshot provides clear pricing based on a detailed brief.",
  },
  {
    q: "How long does corporate video production take?",
    a: "A standard corporate video typically takes 2-3 weeks from shoot to delivery including editing. Larger productions with multiple shoot days, motion graphics, or complex post-production take longer.",
  },
  {
    q: "Can Astroshot produce corporate videos in Arabic?",
    a: "Yes. Astroshot produces corporate videos in Arabic, English, and bilingual formats — including Arabic voiceover, subtitles, and on-screen text adapted for Arabic-language audiences.",
  },
];

export default function CorporateVideoKuwaitPage() {
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
            Corporate Video
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Corporate Video Production in Kuwait for Businesses That Mean Business
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot produces premium corporate videos for businesses in Kuwait and the GCC — brand films, company profiles, testimonials, and corporate content that communicates credibility and builds trust.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors">
              View Our Work
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
              Start Your Project
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot produces corporate videos that make businesses look as credible, professional, and premium as they actually are. From company profile films and CEO interviews to testimonial videos and annual report summaries — we handle scripting, production, and delivery with the same creative quality we bring to commercial brand work.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Corporate Video Services</h3>
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

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Industries We Serve</h2>
            <div className="mt-8 grid grid-cols-1 gap-3">
              {industries.map((item) => (
                <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-4 text-sm text-white/90">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Why Corporate Video</h2>
            <p className="mt-4 text-white/70 leading-relaxed text-base">
              Video communicates what text and images alone cannot — tone, credibility, and personality. For B2B businesses in Kuwait, a premium corporate video is one of the highest-impact investments in how the company is perceived.
            </p>
            <div className="mt-6 grid grid-cols-1 gap-3">
              {whyCorporateVideo.map((item) => (
                <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-4 text-sm text-white/85 flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full bg-[#01F17C]/15 border border-[#01F17C]/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#01F17C] text-xs">✓</span>
                  </span>
                  {item}
                </div>
              ))}
            </div>
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
            Your company deserves a video that does it justice.
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s produce a corporate film that builds trust and makes the right impression.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Start Your Project
          </Link>
        </div>
      </section>
    </div>
  );
}
