"use client";

const clients = [
  "Mercedes",
  "BMW",
  "Gulf Bank",
  "NBK",
  "Honda",
  "IKEA",
  "Virgin Mobile",
  "BYD",
  "Zain",
  "Costa Coffee",
  "Caribou",
  "Trolley",
  "Hongqi",
  "Ford",
  "National Geographic",
];

export default function Marquee() {
  const doubled = [...clients, ...clients];

  return (
    <section className="py-16 bg-[#FAFAFA] overflow-hidden border-y border-[#f0f0f0]">
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-12 whitespace-nowrap will-change-transform">
          {doubled.map((client, i) => (
            <span key={i} className="flex items-center gap-12">
              <span className="text-sm font-700 uppercase tracking-[0.2em] text-[#111111]">
                {client}
              </span>
              <span className="text-[#01F17C] text-lg font-900">·</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
