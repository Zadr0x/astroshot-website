import Link from "next/link";
import { caseStudyDataByProjectId } from "@/lib/case-study-data";

type ServiceProofLinksProps = {
  eyebrow?: string;
  title?: string;
  intro?: string;
  projectIds: string[];
  serviceLinks?: {
    label: string;
    href: string;
  }[];
};

export default function ServiceProofLinks({
  eyebrow = "Related Proof",
  title = "Case studies connected to this service",
  intro = "Explore real Astroshot work tied to this capability, from launch films and CGI campaigns to long-term social media growth.",
  projectIds,
  serviceLinks = [],
}: ServiceProofLinksProps) {
  const caseStudies = projectIds
    .map((id) => ({ id, data: caseStudyDataByProjectId[id] }))
    .filter((item) => item.data);
  const clampTwoLines = {
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical" as const,
    overflow: "hidden",
  };

  if (caseStudies.length === 0) return null;

  return (
    <section>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            {eyebrow}
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white lg:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/65">
            {intro}
          </p>
        </div>
        <Link
          href="/portfolio"
          className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-[#01F17C] hover:text-[#01F17C]"
        >
          View Portfolio
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {caseStudies.map(({ id, data }) => (
          <Link
            key={id}
            href={`/portfolio/${id}`}
            className="group rounded-2xl border border-white/10 bg-[#0d0d0d] p-5 transition-colors hover:border-[#01F17C]/60"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#01F17C]">
              {data.client}
            </p>
            <h3 className="mt-3 min-h-[3rem] text-lg font-extrabold leading-tight text-white" style={clampTwoLines}>
              {data.campaignType}
            </h3>
            <div className="mt-4 flex items-center justify-between gap-4">
              {data.facts.slice(0, 1).map((fact) => (
                <span
                  key={`${fact.label}-${fact.value}`}
                  className="min-w-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/75"
                >
                  {fact.value}
                </span>
              ))}
              <span className="shrink-0 text-xs font-black text-white/45 transition-colors group-hover:text-[#01F17C]">
                Open →
              </span>
            </div>
          </Link>
        ))}
      </div>

      {serviceLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {serviceLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-white/10 px-4 py-2 text-xs font-bold uppercase tracking-widest text-white/55 transition-colors hover:border-[#01F17C]/60 hover:text-[#01F17C]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
