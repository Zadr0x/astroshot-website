"use client";

import { useEffect, useState } from "react";

export default function AdminThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("astroshot-admin-theme") === "light" ? "light" : "dark";
    setTheme(saved);
    document.documentElement.dataset.adminTheme = saved;
  }, []);

  const changeTheme = (nextTheme: "dark" | "light") => {
    setTheme(nextTheme);
    window.localStorage.setItem("astroshot-admin-theme", nextTheme);
    document.documentElement.dataset.adminTheme = nextTheme;
  };

  return (
    <div className="admin-theme-toggle grid grid-cols-2 rounded-lg border border-white/10 bg-white/[0.04] p-0.5 text-[10px] font-black uppercase tracking-widest text-white/45">
      {(["dark", "light"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => changeTheme(option)}
          className={`rounded-md px-2.5 py-1.5 transition-colors ${theme === option ? "bg-white text-black" : "hover:bg-white/[0.06] hover:text-white"}`}
          aria-pressed={theme === option}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
