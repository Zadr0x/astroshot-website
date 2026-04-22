"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type ClientEntry = {
  id: string;
  name: string;
  logo_url: string | null;
};

const defaultLogos = [
  { name: "Mercedes-Benz", logo: "/logos/mercedes.svg" },
  { name: "BMW", logo: "/logos/bmw.svg" },
  { name: "IKEA", logo: "/logos/ikea.svg" },
  { name: "Virgin Mobile", logo: "/logos/virgin-mobile.svg" },
  { name: "Chevrolet", logo: "/logos/chevrolet.svg" },
  { name: "National Geographic", logo: "/logos/national-geographic.svg" },
  { name: "Huawei", logo: "/logos/huawei.svg" },
  { name: "Ford", logo: "/logos/ford.svg" },
  { name: "Costa Coffee", logo: "/logos/costa-coffee.svg" },
  { name: "Jahez", logo: "/logos/jahez.svg" },
  { name: "NBK", logo: "/logos/nbk.svg" },
  { name: "Cadillac", logo: "/logos/cadillac.svg" },
  { name: "BYD", logo: "/logos/byd.svg" },
  { name: "Gulf Bank", logo: "/logos/gulf-bank.svg" },
  { name: "Honda", logo: "/logos/honda.svg" },
  { name: "Trolley", logo: "/logos/trolley.svg" },
];

export default function Marquee() {
  const [clients, setClients] = useState<ClientEntry[]>([]);

  useEffect(() => {
    supabase
      .from("clients")
      .select("id, name, logo_url")
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setClients(data);
      });
  }, []);

  const logos = clients.length > 0
    ? clients.map((c) => ({ name: c.name, logo: c.logo_url ?? "" }))
    : defaultLogos;

  // Duplicate for seamless loop
  const doubled = [...logos, ...logos];

  return (
    <section className="py-12 bg-white border-y border-[#f0f0f0] overflow-hidden">
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#999999]">
          Trusted By
        </span>
      </div>

      <style>{`
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll 30s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="relative">
        <div className="marquee-track">
          {doubled.map((item, i) => (
            <div
              key={i}
              className="flex items-center justify-center mx-10 opacity-60 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300 flex-shrink-0"
            >
              {item.logo ? (
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={120}
                  height={44}
                  className="object-contain h-11 w-auto max-w-[120px]"
                  unoptimized
                />
              ) : (
                <span className="text-sm font-bold uppercase tracking-wider text-[#111111] whitespace-nowrap">
                  {item.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
