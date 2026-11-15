"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", icon: "home", href: "/admin/ai-menu" },
  { label: "Generate", icon: "✦", href: "/admin/ai-generate" },
  { label: "Profile", icon: "profile", href: "/admin/access" },
  { label: "Chat", icon: "chat", href: "/admin/ai-chat" },
  { label: "Gallery", icon: "gallery", href: "/admin/ai-gallery" },
];

function NavIcon({ icon }: { icon: string }) {
  if (icon === "home") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M6.5 10.5V20h5v-5h3v5h5v-9.5" />
      </svg>
    );
  }
  if (icon === "profile") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="8" r="3.5" />
        <path d="M5 20c1.4-3.2 3.8-4.8 7-4.8s5.6 1.6 7 4.8" />
      </svg>
    );
  }
  if (icon === "chat") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 6.5h14v9.5H9l-4 3v-13.5Z" />
        <path d="M9 10h6" />
        <path d="M9 13h3" />
      </svg>
    );
  }
  if (icon === "gallery") {
    return (
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="m7 16 3.5-4 3 3 2-2.5L19 16" />
        <circle cx="9" cy="9" r="1" />
      </svg>
    );
  }
  return <span className="text-[22px] leading-none">{icon}</span>;
}

export default function AiAppBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-4 bottom-4 z-40 mx-auto grid h-[72px] max-w-[520px] grid-cols-5 rounded-[28px] border border-white/15 bg-white/[0.13] px-2 shadow-[0_18px_70px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl lg:hidden">
      {navItems.map((item) => {
        const active = pathname.startsWith(item.href);
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-[23px] text-[10px] font-semibold transition-colors ${
              active ? "bg-white/18 text-[#01F17C] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]" : "text-white/88"
            }`}
          >
            <NavIcon icon={item.icon} />
            <span className="truncate">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
