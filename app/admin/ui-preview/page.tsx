"use client";

export const dynamic = "force-dynamic";

const productUrl = "https://xurzuofmpwfhtlkxppej.supabase.co/storage/v1/object/public/content-calendar-assets/lil-orbit/1780593849762-hi7b9y4az5-IMG_2194--1-.PNG";
const referenceUrl = "https://xurzuofmpwfhtlkxppej.supabase.co/storage/v1/object/public/content-calendar-assets/lil-orbit/1780594985396-lz8w8205za-IMG_2495.JPG";
const modelUrls = [
  {
    name: "Model B",
    url: "/admin-ui-preview/model-b-preview.jpg",
  },
  {
    name: "Model C",
    url: "/admin-ui-preview/model-c-preview.jpg",
  },
  {
    name: "Model F",
    url: "/admin-ui-preview/model-f-preview.jpg",
  },
  {
    name: "Model G",
    url: "/admin-ui-preview/model-g-preview.jpg",
  },
];

const inputClass = "h-10 rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-white/25";
const labelClass = "mb-1.5 block text-[12px] font-medium text-white/45";

export default function AdminUiPreviewPage() {
  return (
    <main className="min-h-screen bg-[#050505] px-5 py-6 text-white antialiased" style={{ fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/10 pb-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-medium text-[#01F17C]">Preview only</p>
            <h1 className="mt-1 text-[28px] font-semibold tracking-[-0.02em] text-white md:text-[32px]">Admin UI system reset</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
              Lighter typography, flatter spacing, quieter controls, smaller AI selectors, and Access redesigned around management first.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/70">Access</button>
            <button className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm font-medium text-white/70">Astro Magic</button>
          </div>
        </div>

        <section className="mb-10">
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-[-0.01em]">Access</h2>
              <p className="mt-1 text-sm text-white/45">Accounts first. Create forms move into drawers instead of taking the full first screen.</p>
            </div>
            <button className="rounded-lg bg-[#01F17C] px-3.5 py-2 text-sm font-semibold text-black">Add account</button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            {[
              ["Team", "2 active"],
              ["Client Portal", "3 active"],
              ["Admins", "2 full access"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
                <p className="text-sm text-white/42">{label}</p>
                <p className="mt-1 text-xl font-semibold tracking-[-0.01em]">{value}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02]">
            <div className="flex border-b border-white/10 px-3 pt-3">
              <button className="border-b-2 border-[#01F17C] px-3 pb-3 text-sm font-medium text-white">Team</button>
              <button className="px-3 pb-3 text-sm font-medium text-white/45">Client Portal</button>
            </div>

            <div className="divide-y divide-white/8">
              {[
                ["Astroshot Admin", "subscription@astroshotpm.com", "Admin", "Full access"],
                ["Astroshot Team", "astroshot-team@astroshotpm.com", "Admin", "Full access"],
                ["Account Manager", "manager@astroshotpm.com", "Account Manager", "Content + questionnaires"],
              ].map(([name, email, role, scope]) => (
                <div key={email} className="grid gap-3 px-4 py-3 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-center">
                  <div>
                    <p className="text-sm font-medium text-white">{name}</p>
                    <p className="mt-0.5 text-sm text-white/38">{email}</p>
                  </div>
                  <p className="text-sm text-white/50">{scope}</p>
                  <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/60">{role}</span>
                  <button className="w-fit rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/45">Manage</button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_420px]">
          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold tracking-[-0.01em]">Astro Magic popup</h2>
              <p className="mt-1 text-sm text-white/45">Selected assets become compact circular selectors instead of large cards.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-[#111]/70 p-5 shadow-2xl shadow-black/30">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-[#01F17C]">Content 4</p>
                  <h3 className="mt-1 text-xl font-semibold tracking-[-0.01em]">Generate image</h3>
                </div>
                <button title="Close" aria-label="Close" className="rounded-lg border border-white/10 px-2.5 py-1.5 text-sm text-white/50">Close</button>
              </div>

              <div className="mb-5 flex flex-wrap gap-4">
                <AssetBubble title="Product" subtitle="Mini Donuts" url={productUrl} />
                <AssetBubble title="Reference" subtitle="Funky Room" url={referenceUrl} />
                <AssetBubble title="Model" subtitle="Model C" url={modelUrls[1].url} selected />
              </div>

              <label className="mb-4 block">
                <span className={labelClass}>Style</span>
                <div className="flex flex-wrap gap-2">
                  {["Cinematic", "iPhone", "Editorial", "Surprise"].map((style, index) => (
                    <button key={style} className={`rounded-full px-3 py-1.5 text-sm font-medium ${index === 1 ? "bg-white text-black" : "border border-white/10 bg-white/[0.04] text-white/55"}`}>{style}</button>
                  ))}
                </div>
              </label>

              <label className="block">
                <span className={labelClass}>Direction</span>
                <textarea
                  className="min-h-28 w-full rounded-xl border border-white/10 bg-white/[0.035] p-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-white/25"
                  placeholder="Premium iPhone-style shot, natural hand pose, product visible, bright Kuwaiti café mood..."
                />
              </label>

              <div className="mt-5 flex justify-end gap-2">
                <button className="rounded-lg border border-white/10 px-3.5 py-2 text-sm font-medium text-white/55">Cancel</button>
                <button className="rounded-lg bg-[#01F17C] px-3.5 py-2 text-sm font-semibold text-black">Generate</button>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold tracking-[-0.01em]">Model selection</h2>
              <p className="mt-1 text-sm text-white/45">Preview should show one clean model portrait, not the full character sheet.</p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
              <div className="grid grid-cols-2 gap-3">
                {modelUrls.map((model, index) => (
                  <button key={model.name} className={`rounded-xl border p-3 text-left transition ${index === 1 ? "border-[#01F17C]/60 bg-[#01F17C]/8" : "border-white/10 bg-white/[0.025]"}`}>
                    <div className="mx-auto h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-white">
                      <img src={model.url} alt="" className="h-full w-full object-cover object-top" />
                    </div>
                    <p className="mt-3 text-center text-sm font-medium text-white">{model.name}</p>
                    <p className="mt-0.5 text-center text-xs text-white/38">Clean portrait preview</p>
                  </button>
                ))}
              </div>

              <div className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/8 p-3 text-xs leading-5 text-amber-100/70">
                Production note: this needs a saved `previewUrl` per model or an automatic portrait-crop/generated white-background preview. The generator can still use the full character sheet behind the scenes.
              </div>
            </div>
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="text-xl font-semibold tracking-[-0.01em]">Component direction</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label>
              <span className={labelClass}>Normal input</span>
              <input className={inputClass} placeholder="Lighter, shorter, less bordered" />
            </label>
            <label>
              <span className={labelClass}>Role</span>
              <select className={inputClass} defaultValue="admin">
                <option value="admin">Admin</option>
                <option value="manager">Account Manager</option>
              </select>
            </label>
          </div>
        </section>
      </div>
    </main>
  );
}

function AssetBubble({ title, subtitle, url, selected = false }: { title: string; subtitle: string; url: string; selected?: boolean }) {
  return (
    <button className="group flex min-w-24 flex-col items-center gap-2">
      <div className={`h-20 w-20 overflow-hidden rounded-full border bg-white transition ${selected ? "border-[#01F17C] ring-4 ring-[#01F17C]/15" : "border-white/12 group-hover:border-white/30"}`}>
        <img src={url} alt="" className="h-full w-full object-cover object-center" />
      </div>
      <div className="text-center">
        <p className="text-xs font-medium text-white/45">{title}</p>
        <p className="max-w-24 truncate text-sm font-medium text-white">{subtitle}</p>
      </div>
    </button>
  );
}
