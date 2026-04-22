"use client";

// TODO: Replace placeholders with real Instagram embed when Meta API is approved
// Instagram Basic Display API or a service like Behold.so can be used

const placeholders = [
  { gradient: "from-[#01F17C]/20 to-[#050505]" },
  { gradient: "from-purple-500/20 to-[#050505]" },
  { gradient: "from-blue-500/20 to-[#050505]" },
  { gradient: "from-orange-500/20 to-[#050505]" },
  { gradient: "from-pink-500/20 to-[#050505]" },
  { gradient: "from-cyan-500/20 to-[#050505]" },
  { gradient: "from-[#01F17C]/20 to-[#050505]" },
  { gradient: "from-yellow-500/20 to-[#050505]" },
];

const doubled = [...placeholders, ...placeholders];

export default function InstagramSection() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#01F17C]">
          Instagram
        </span>
        <h2 className="mt-3 text-3xl lg:text-4xl font-black text-[#111111] tracking-tight">
          Follow Our Work
        </h2>
        <p className="mt-2 text-[#666666] text-sm">@astroshotmedia</p>
      </div>

      <style>{`
        @keyframes insta-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .insta-track {
          display: flex;
          width: max-content;
          animation: insta-scroll 25s linear infinite;
        }
        .insta-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative">
        <div className="insta-track">
          {doubled.map((item, i) => (
            <a
              key={i}
              href="https://instagram.com/astroshotmedia"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 mx-2 group"
            >
              <div
                className={`w-56 h-56 rounded-2xl bg-gradient-to-br ${item.gradient} bg-[#111] flex flex-col items-center justify-center border border-white/5 group-hover:border-[#01F17C]/30 transition-all duration-300 relative overflow-hidden`}
              >
                {/* Astroshot watermark */}
                <div className="absolute top-3 left-3">
                  <span className="text-[10px] font-black text-white/30 tracking-widest">ASTROSHOT</span>
                </div>
                {/* Green dot accent */}
                <div className="w-2 h-2 rounded-full bg-[#01F17C] mb-3 group-hover:scale-150 transition-transform duration-300" />
                {/* Camera icon */}
                <svg className="w-8 h-8 text-white/20 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-white/30 text-xs font-semibold">View on Instagram</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div className="text-center mt-10">
        <a
          href="https://instagram.com/astroshotmedia"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[#111111] text-[#111111] text-sm font-bold hover:bg-[#111111] hover:text-white transition-all duration-300"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
          </svg>
          Follow @astroshotmedia
        </a>
      </div>
    </section>
  );
}
