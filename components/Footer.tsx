import Link from "next/link";

const footerLinks = {
  Company: [
    { href: "/about", label: "About Us" },
    { href: "/portfolio", label: "Projects" },
    { href: "/services", label: "Services" },
    { href: "/contact", label: "Contact" },
  ],
  Services: [
    { href: "/services#vfx", label: "VFX & CGI" },
    { href: "/services#social", label: "Social Media" },
    { href: "/services#branding", label: "Branding" },
    { href: "/services#3d", label: "3D Animation" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#050505] text-white border-t-2 border-[#01F17C]">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2">
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
                href="mailto:info@astroshotpm.com"
                className="hover:text-[#01F17C] transition-colors"
              >
                info@astroshotpm.com
              </a>
              <a
                href="tel:+96593336065"
                className="hover:text-[#01F17C] transition-colors"
              >
                +965 9333 6065
              </a>
              <a
                href="https://instagram.com/astroshotmedia"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#01F17C] transition-colors"
              >
                @astroshotmedia
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
                  <li key={link.href}>
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

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#444444]">
            © {new Date().getFullYear()} Astroshot Project Management Company.
            All rights reserved.
          </p>
          <p className="text-xs text-[#444444]">
            Qibla Block 13, Al Salam Tower, 16th Floor — Kuwait City, Kuwait
          </p>
        </div>
      </div>
    </footer>
  );
}
