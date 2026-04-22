"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";

const navItems = [
  { href: "/admin", label: "Overview", icon: "◈" },
  { href: "/admin/projects", label: "Projects", icon: "⬡" },
  { href: "/admin/blog", label: "Blog", icon: "✍" },
  { href: "/admin/services", label: "Services", icon: "⚡" },
  { href: "/admin/clients", label: "Clients", icon: "★" },
  { href: "/admin/content", label: "Site Content", icon: "✦" },
  { href: "/admin/submissions", label: "Form Submissions", icon: "◎" },
  { href: "/admin/careers", label: "Careers", icon: "◑" },
  { href: "/admin/settings", label: "Settings", icon: "⚙" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-white/10">
        <Link href="/admin" className="block">
          <span className="text-lg font-black text-white tracking-tight">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </span>
          <p className="text-xs text-[#444444] mt-0.5">CMS Dashboard</p>
        </Link>
      </div>

      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 ${
                isActive(item.href)
                  ? "border-l-2 border-[#01F17C] bg-[#01F17C]/10 text-[#01F17C] pl-[10px]"
                  : "text-[#666666] hover:text-white hover:bg-white/5"
              }`}
            >
              <span className="text-base w-5 text-center shrink-0">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-white/10 space-y-3">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#444444] hover:text-white transition-colors"
        >
          <span>↗</span> View Site
        </Link>
        <button
          onClick={handleSignOut}
          className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-[#444444] hover:text-red-400 transition-colors"
        >
          <span>→</span> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 min-h-screen bg-[#0a0a0a] border-r border-white/10 flex-col fixed top-0 left-0 bottom-0 z-40">
        <SidebarContent />
      </aside>

      {/* Mobile header bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-4 h-14">
        <Link href="/admin">
          <span className="text-base font-black text-white tracking-tight">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-2"
          aria-label="Toggle menu"
        >
          <div className="w-5 h-4 flex flex-col justify-between">
            <span className={`block h-0.5 bg-white transition-all ${mobileOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
            <span className={`block h-0.5 bg-white transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 bg-white transition-all ${mobileOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
          </div>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute top-0 left-0 bottom-0 w-64 bg-[#0a0a0a] pt-14">
            <SidebarContent />
          </aside>
        </div>
      )}
    </>
  );
}
