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

  return (
    <section className="py-16 bg-white border-y border-[#f0f0f0]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#999999]">
            Trusted By
          </span>
        </div>

        <div className="flex flex-wrap justify-center gap-x-10 gap-y-8">
          {hasClients
            ? clients.map((client) =>
                client.logo_url ? (
                  <div
                    key={client.id}
                    className="flex items-center justify-center opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                  >
                    <Image
                      src={client.logo_url}
                      alt={client.name}
                      width={120}
                      height={40}
                      className="object-contain h-10 w-auto"
                    />
                  </div>
                ) : (
                  <div
                    key={client.id}
                    className="flex items-center justify-center opacity-70 hover:opacity-100 transition-all duration-300"
                  >
                    <span className="text-sm font-bold uppercase tracking-wider text-[#111111]">
                      {client.name}
                    </span>
                  </div>
                )
              )
            : defaultClients.map((client) => (
                <div
                  key={client.name}
                  className="flex items-center justify-center opacity-70 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-300"
                >
                  <Image
                    src={client.logo}
                    alt={client.name}
                    width={120}
                    height={40}
                    className="object-contain h-10 w-auto"
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
