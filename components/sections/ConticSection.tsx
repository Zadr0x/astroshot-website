import Link from "next/link";

const capabilities = [
  "AI-assisted captions and content ideas",
  "Social media scripts and campaign directions",
  "Voice, character, image and video generation workflows",
  "Prompt and creative tools for brands and creators",
];

export default function ConticSection() {
  return (
    <section className="py-24 lg:py-32 bg-[#0a0a0a] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
              Our Product
            </p>
            <h2 className="mt-4 text-4xl lg:text-6xl font-800 text-white leading-[1.05] tracking-tight">
              Contic
            </h2>
            <p className="mt-4 text-lg text-white/80 font-600">
              AI Marketing App by Astroshot LLC
            </p>
            <p className="mt-6 text-[#888888] text-base leading-relaxed max-w-xl">
              Contic is our own AI marketing application — built to help
              creators, brands and marketing teams produce social content
              faster. Captions, scripts, content ideas, voice workflows and
              image generation, in one app.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Link
                href="/contic"
                className="px-8 py-4 text-sm font-700 rounded-2xl bg-[#01F17C] text-[#050505] hover:bg-[#00d96e] transition-colors text-center"
              >
                About Contic
              </Link>
              <Link
                href="/contic"
                className="px-8 py-4 text-sm font-700 rounded-2xl border border-white/20 text-white hover:border-[#01F17C]/50 transition-colors text-center"
              >
                Support &amp; Contact
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-black p-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                    Product
                  </p>
                  <p className="mt-1 text-2xl font-black text-white">Contic</p>
                </div>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#01F17C] text-2xl font-black text-black">
                  C
                </div>
              </div>
              <div className="grid gap-3 py-5">
                {capabilities.map((item) => (
                  <div
                    key={item}
                    className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm font-semibold leading-6 text-white/72"
                  >
                    {item}
                  </div>
                ))}
              </div>
              <div className="rounded-xl border border-[#01F17C]/25 bg-[#01F17C]/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#01F17C]">
                  Developed &amp; operated by
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-white/78">
                  Astroshot LLC — a US-registered company formed in Wyoming.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
