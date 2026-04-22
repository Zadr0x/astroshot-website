"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type ClientEntry = {
  id: string;
  name: string;
  logo_url: string | null;
};

const defaultClients = [
  "Mercedes",
  "BMW",
  "IKEA",
  "Virgin Mobile",
  "Chevrolet",
  "National Geographic",
  "Huawei",
  "Ford",
  "Costa Coffee",
  "Jahez",
  "National Bank of Kuwait",
  "Cadillac",
  "BYD",
  "Gulf Bank Kuwait",
  "Honda",
  "Trolley",
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

  const renderItem = (item: ClientEntry | string, i: number) => {
    if (typeof item === "string") {
      return (
        <span key={i} className="flex items-center gap-10">
          <span className="text-sm font-bold uppercase tracking-wider text-[#111111] whitespace-nowrap">
            {item}
          </span>
          <span className="text-[#01F17C] text-base font-black">·</span>
        </span>
      );
    }
    return (
      <span key={item.id} className="flex items-center gap-10">
        {item.logo_url ? (
          <span className="flex items-center h-7 relative">
            <Image
              src={item.logo_url}
              alt={item.name}
              width={80}
              height={28}
              className="object-contain grayscale brightness-0"
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
  };

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
          {[...row1, ...row1].map((item, i) => renderItem(item as ClientEntry | string, i))}
        </div>
      </div>

      {/* Row 2 — scrolls right */}
      <div className="relative flex overflow-hidden">
        <div className="animate-marquee-reverse flex items-center gap-10 whitespace-nowrap will-change-transform">
          {[...row2, ...row2].map((item, i) => renderItem(item as ClientEntry | string, i + 100))}
        </div>
      </div>
    </section>
  );
}
