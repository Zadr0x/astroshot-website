import Link from "next/link";

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  children: React.ReactNode;
};

export default function DreamLegalPage({ eyebrow, title, updated, children }: LegalPageProps) {
  return (
    <main className="min-h-screen bg-[#050714] px-5 py-8 text-white sm:px-8">
      <section className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/dream" className="text-sm font-semibold text-white/60 transition hover:text-white">
            Dream
          </Link>
          <a href="mailto:info@astroshotpm.com" className="text-sm font-semibold text-white/60 transition hover:text-white">
            Contact
          </a>
        </div>

        <header className="rounded-[28px] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/30 sm:p-10">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-cyan-200/70">{eyebrow}</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] text-white sm:text-6xl">{title}</h1>
          <p className="mt-5 text-sm font-semibold text-white/45">Last updated: {updated}</p>
        </header>

        <article className="legal-copy rounded-[28px] border border-white/10 bg-white/[0.035] p-7 text-white/72 sm:p-10">
          {children}
        </article>
      </section>
    </main>
  );
}

