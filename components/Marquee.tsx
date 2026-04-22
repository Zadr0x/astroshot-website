"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type ClientEntry = {
  id: string;
  name: string;
  logo_url: string | null;
};

type DefaultClient = {
  name: string;
  logo: string;
};

const defaultClients: DefaultClient[] = [
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

const row1Defaults = defaultClients.slice(0, 8);
const row2Defaults = defaultClients.slice(8);

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

  const hasClients = clients.length > 0;
  const row1 = hasClients ? clients.slice(0, Math.ceil(clients.length / 2)) : row1Defaults;
  const row2 = hasClients ? clients.slice(Math.ceil(clients.length / 2)) : row2Defaults;

  const renderDefaultItem = (item: DefaultClient, i: number) => (
    <span key={i} className="flex items-center gap-10">
      <span className="flex items-center h-8 relative grayscale hover:grayscale-0 transition-all duration-300 bg-white px-3 py-1 rounded">
        <Image
          src={item.logo}
          alt={item.name}
          width={120}
          height={32}
          className="object-contain"
        />
      </span>
      <span className="text-[#01F17C] text-base font-black">·</span>
    </span>
  );

  const renderClientItem = (item: ClientEntry, i: number) => (
    <span key={item.id ?? i} className="flex items-center gap-10">
      {item.logo_url ? (
        <span className="flex items-center h-8 relative grayscale hover:grayscale-0 transition-all duration-300 bg-white px-3 py-1 rounded">
          <Image
            src={item.logo_url}
            alt={item.name}
            width={120}
            height={32}
            className="object-contain"
          />
        </span>
      ) : (
        <span className="text-sm font-bold uppercase tracking-wider text-[#111111] whitespace-nowrap">
          {item.name}
        </span>
      )}
      <span className="text-[#01F17C] text-base font-black">·</span>
    </span>
  );

  return (
    <section className="py-16 bg-white overflow-hidden border-y border-[#f0f0f0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 mb-8 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#999999]">
          Trusted By
        </span>
      </div>

      {/* Row 1 — scrolls left */}
      <div className="relative flex overflow-hidden mb-4">
        <div className="animate-marquee flex items-center gap-10 whitespace-nowrap will-change-transform">
          {hasClients
            ? [...row1 as ClientEntry[], ...row1 as ClientEntry[]].map((item, i) => renderClientItem(item, i))
            : [...row1Defaults, ...row1Defaults].map((item, i) => renderDefaultItem(item, i))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee-reverse flex items-center gap-10 whitespace-nowrap will-change-transform">
          {hasClients
            ? [...row2 as ClientEntry[], ...row2 as ClientEntry[]].map((item, i) => renderClientItem(item, i + 100))
            : [...row2Defaults, ...row2Defaults].map((item, i) => renderDefaultItem(item, i + 100))}
        </div>
      </div>
    </section>
  );
}
