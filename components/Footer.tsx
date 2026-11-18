import Link from "next/link";
import { companyInfo } from "@/lib/company-info";

const footerLinks = {
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/portfolio", label: "Projects" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ],
  Product: [
    { href: "/contic", label: "Contic" },
    { href: "/contic", label: "Support" },
  ],
  Legal: [
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/terms-and-conditions", label: "Terms & Conditions" },
    { href: "/refund-policy", label: "Refund Policy" },
  ],
};

const services = [
  { href: "/services#vfx", label: "VFX & CGI" },
  { href: "/services#social", label: "Social Media" },
  { href: "/services#branding", label: "Branding" },
  { href: "/services#3d", label: "3D Animation" },
];

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white border-t-2 border-[#01F17C]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <span className="text-2xl font-black tracking-tight">
                ASTRO<span className="text-[#01F17C]">SHOT</span>
              </span>
            </Link>
            <p className="text-[#666666] text-sm leading-relaxed max-w-xs">
              Kuwait&apos;s leading VFX, CGI, and creative marketing agency.
              Making brands impossible to ignore across the GCC.
            </p>
            <div className="mt-6 flex flex-col gap-1 text-sm text-[#666666]">
              <a
                href={`mailto:${companyInfo.email}`}
                className="hover:text-[#01F17C] transition-colors"
              >
                {companyInfo.email}
              </a>
              <a
                href={companyInfo.phoneHref}
                className="hover:text-[#01F17C] transition-colors"
              >
                {companyInfo.phoneDisplay}
              </a>
              <a
                href={companyInfo.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#01F17C] transition-colors"
              >
                {companyInfo.instagram}
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-700 uppercase tracking-widest text-[#01F17C] mb-4">
                {category}
              </h4>
              <ul className="flex flex-col gap-2">
                {links.map((link) => (
                  <li key={`${category}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-[#666666] hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs text-[#444444]">
              © {new Date().getFullYear()} {companyInfo.legalName}. All rights
              reserved.
            </p>
            <p className="text-xs text-[#444444]">
              Kuwait Office — Qibla Block 13, Al Salam Tower, 16th Floor, Office
              No 7, Kuwait City, Kuwait
            </p>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <p className="text-xs text-[#444444]">
              {companyInfo.legalName} · Registered in {companyInfo.stateOfFormation} · EIN{" "}
              {companyInfo.ein}
            </p>
            <p className="text-xs text-[#444444]">
              {companyInfo.addressLines.join(", ")}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
