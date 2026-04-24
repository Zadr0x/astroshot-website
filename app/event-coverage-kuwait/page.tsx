import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Event Coverage in Kuwait | Astroshot",
  description:
    "Astroshot provides professional event coverage in Kuwait. Photography, videography, and highlight films for corporate events, product launches, activations, and brand events across Kuwait and the GCC.",
  keywords: [
    "event coverage Kuwait",
    "event photography Kuwait",
    "event videography Kuwait",
    "corporate event Kuwait",
    "event filming Kuwait",
    "event highlight video Kuwait",
    "brand event Kuwait",
  ],
};

const services = [
  "Event photography",
  "Event videography and filming",
  "Highlight reel production",
  "Live event social media content",
  "Same-day event edits",
  "Drone and aerial event coverage",
  "Product launch event production",
];

const eventTypes = [
  "Corporate events and conferences",
  "Product launches and reveals",
  "Brand activations",
  "Press and media events",
  "Awards and galas",
  "Exhibitions and trade shows",
  "Showroom openings",
  "Seasonal and Ramadan events",
];

const deliverables = [
  "Edited highlight film (1-3 min)",
  "Short social media cut (30-60 sec)",
  "Full event photo gallery",
  "Social media ready crops and edits",
  "Same-day story content (on request)",
  "RAW footage on request",
];

const faqs = [
  {
    q: "What event coverage services does Astroshot offer?",
    a: "Astroshot provides end-to-end event coverage — photography, videography, highlight film production, drone coverage, and same-day social media edits. We cover corporate events, product launches, brand activations, press events, and galas across Kuwait and the GCC.",
  },
  {
    q: "How quickly does Astroshot deliver event content?",
    a: "Standard event highlight films are delivered within 3-5 working days. Same-day and rush edits are available for events that need immediate social media content — this is agreed in advance during briefing.",
  },
  {
    q: "Does Astroshot provide drone coverage for events?",
    a: "Yes. Astroshot offers aerial and drone coverage for outdoor events in Kuwait — adding cinematic production value and unique perspectives to event highlight films.",
  },
  {
    q: "Can Astroshot create social media content during the event?",
    a: "Yes. Astroshot can produce same-day social media content — short cuts, Stories, and Reels — that can be published while the event is still live. This requires advance planning and is agreed as part of the brief.",
  },
  {
    q: "How many photographers and videographers does Astroshot send?",
    a: "The team size depends on the event scale. Astroshot matches the production crew to the event size and scope — from a single photographer for intimate events to full multi-camera production teams for large launches.",
  },
  {
    q: "Does Astroshot cover events outside Kuwait?",
    a: "Yes. Astroshot covers events across Kuwait, Saudi Arabia, and the UAE — and is available for GCC event coverage on request.",
  },
];

export default function EventCoverageKuwaitPage() {
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
            Event Coverage
          </span>
          <h1 className="mt-3 text-5xl lg:text-7xl font-extrabold text-white tracking-tight max-w-4xl leading-[1.05]">
            Event Coverage in Kuwait That Captures Every Moment Worth Keeping
          </h1>
          <p className="mt-5 text-white/60 text-base max-w-3xl leading-relaxed">
            Astroshot covers corporate events, product launches, activations, and brand events in Kuwait and the GCC — with professional photography, videography, and highlight films that make every event last beyond the day.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/portfolio" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl border border-white/20 text-white hover:border-[#01F17C] hover:text-[#01F17C] transition-colors">
              View Our Work
            </Link>
            <Link href="/contact" className="inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
              Book Event Coverage
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 lg:py-20 space-y-20">
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What We Do</h2>
            <p className="mt-5 text-white/70 leading-relaxed text-base">
              Astroshot covers events with the same level of creative quality we bring to commercial productions. Every event is covered professionally — from photography and videography through to edited highlight films, social media cuts, and drone coverage. We make sure every event moment is captured, edited, and delivered in a way that does justice to the brand behind it.
            </p>
          </div>
          <div className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-8">
            <h3 className="text-xs font-bold uppercase tracking-widest text-[#01F17C] mb-5">Event Coverage Services</h3>
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
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">Events We Cover</h2>
            <div className="mt-8 grid grid-cols-1 gap-3">
              {eventTypes.map((item) => (
                <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-4 text-sm text-white/90">{item}</div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">What You Receive</h2>
            <div className="mt-8 grid grid-cols-1 gap-3">
              {deliverables.map((item) => (
                <div key={item} className="rounded-2xl bg-[#0d0d0d] border border-white/10 p-4 text-sm text-white/90 flex items-center gap-3">
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
            Got an event coming up?
          </h2>
          <p className="mt-6 text-white/60 text-base max-w-2xl mx-auto leading-relaxed">
            Let&apos;s make sure it&apos;s documented at the level it deserves.
          </p>
          <Link href="/contact" className="mt-8 inline-flex items-center justify-center px-8 py-4 text-sm font-bold rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors">
            Book Event Coverage
          </Link>
        </div>
      </section>
    </div>
  );
}
