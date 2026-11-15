export type ClientLogo = {
  name: string;
  logo: string;
};

// Only logos with a verified, real SVG asset are listed here.
// Names without a verified asset render as a clean text wordmark in the UI
// (see ClientLogoWall / Marquee fallback). This prevents broken images.
export const defaultClientLogos: ClientLogo[] = [
  { name: "Chevrolet", logo: "/logos/chevrolet.svg" },
  { name: "BMW", logo: "/logos/bmw.svg" },
  { name: "Honda", logo: "/logos/honda.svg" },
  { name: "Jahez", logo: "/logos/jahez.svg" },
  { name: "National Geographic", logo: "/logos/national_geographic.svg" },
  { name: "Zain", logo: "/logos/zain.svg" },
  { name: "Ford", logo: "/logos/ford.svg" },
  { name: "Gulf Bank", logo: "/logos/gulf-bank.svg" },
  { name: "Cadillac", logo: "/logos/cadillac.svg" },
  { name: "Huawei", logo: "/logos/huawei.svg" },
  { name: "Trolley", logo: "/logos/trolley.svg" },
  { name: "Virgin Mobile", logo: "/logos/virgin-mobile.svg" },
  { name: "Costa Coffee", logo: "/logos/costa-coffee.svg" },
];

const logoByName = new Map(
  defaultClientLogos.map((item) => [normalizeClientName(item.name), item.logo]),
);

function normalizeClientName(name: string) {
  return name.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

export function logoForClientName(name: string) {
  return logoByName.get(normalizeClientName(name)) ?? "";
}
