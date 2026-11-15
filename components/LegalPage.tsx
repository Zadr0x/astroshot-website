type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  sections: LegalSection[];
};

export default function LegalPage({
  eyebrow,
  title,
  intro,
  updatedAt,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#050505] pt-24">
      <section className="px-6 py-16 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
            {eyebrow}
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/65">
            {intro}
          </p>
          <p className="mt-4 text-xs font-semibold uppercase tracking-widest text-white/35">
            Last updated: {updatedAt}
          </p>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-10">
          {sections.map((section) => (
            <section key={section.title} className="border-t border-white/10 pt-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                {section.title}
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-7 text-white/65">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>
    </main>
  );
}
