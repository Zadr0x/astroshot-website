import type { Metadata } from "next";
import Link from "next/link";
import { companyInfo } from "@/lib/company-info";

export const metadata: Metadata = {
  title: "Contic — AI Marketing App by Astroshot LLC",
  description:
    "Contic is an AI marketing application and digital product developed, owned, and operated by Astroshot LLC.",
  alternates: {
    canonical: "https://astroshotmedia.com/contic",
  },
  openGraph: {
    title: "Contic — AI Marketing App by Astroshot LLC",
    description:
      "Contic helps creators, brands, and marketing teams create AI-powered captions, scripts, content ideas, and marketing assets.",
    url: "https://astroshotmedia.com/contic",
    type: "website",
  },
};

const capabilities = [
  "AI-assisted captions and content ideas",
  "Social media scripts and campaign directions",
  "Voice, character, image, and video generation workflows",
  "Prompt and creative tools for brands, creators, and marketing teams",
];

export default function ConticPage() {
  return (
    <main className="min-h-screen bg-[#050505] pt-24 text-white">
      <section className="relative overflow-hidden px-6 py-16 lg:px-8 lg:py-24">
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 14% 18%, rgba(1,241,124,0.12), transparent 55%), radial-gradient(ellipse at 82% 30%, rgba(255,255,255,0.08), transparent 48%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
              Astroshot Product
            </p>
            <h1 className="mt-4 max-w-4xl text-5xl font-extrabold leading-[1.02] tracking-tight text-white md:text-7xl">
              Contic
            </h1>
            <p className="mt-5 max-w-3xl text-xl font-semibold leading-8 text-white/82">
              AI Marketing App by Astroshot LLC
            </p>
            <p className="mt-6 max-w-3xl text-base leading-8 text-white/62">
              Contic is an AI marketing application built to help creators,
              brands, and marketing teams generate social media content faster.
              The app supports AI-assisted captions, scripts, content ideas,
              voice workflows, image generation prompts, and creative marketing
              tools.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center rounded-xl bg-[#01F17C] px-5 py-3 text-sm font-black text-black transition hover:bg-[#00d96e]"
              >
                Contact Astroshot
              </Link>
              <a
                href={`mailto:${companyInfo.email}`}
                className="inline-flex items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-5 py-3 text-sm font-bold text-white transition hover:border-[#01F17C]/40 hover:bg-white/[0.08]"
              >
                {companyInfo.email}
              </a>
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#0d0d0d] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
            <div className="rounded-[1.5rem] border border-white/10 bg-black p-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/35">
                    Product Record
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
                  Ownership
                </p>
                <p className="mt-2 text-sm font-semibold leading-7 text-white/78">
                  Contic is developed, owned, and operated by {companyInfo.legalName}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Official Product Statement
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">
              Contic is a digital product of {companyInfo.legalName}, a
              US-registered company formed in {companyInfo.stateOfFormation}.
              {" "}
              {companyInfo.legalName} manages the Contic mobile application, web
              platform, subscriptions, support, and related AI marketing
              services.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Company Information
            </h2>
            <div className="mt-4 space-y-3 text-sm leading-7 text-white/62">
              <p>{companyInfo.legalName}</p>
              <p>{companyInfo.addressLines.join(", ")}</p>
              <p>EIN: {companyInfo.ein}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-6">
            <h2 className="text-xl font-extrabold tracking-tight text-white">
              Support
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/62">
              For Contic support, product inquiries, account questions, or
              business communication, contact Astroshot LLC.
            </p>
            <a
              href={`mailto:${companyInfo.email}`}
              className="mt-5 inline-flex text-sm font-bold text-[#01F17C] transition hover:text-white"
            >
              {companyInfo.email}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
