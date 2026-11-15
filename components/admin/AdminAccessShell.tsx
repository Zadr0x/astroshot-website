"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { canAccessAiRoute, canAccessCalendarSlug, isCalendarScopedAccount, landingForAccount, landingForPermissions, normalizeAllowedCalendarSlugs, type TeamAccount } from "@/lib/access-control";
import AdminSidebar from "@/components/admin/AdminSidebar";

function requiredPermission(pathname: string): keyof TeamAccount["permissions"] | null {
  if (pathname === "/admin/login") return null;
  if (pathname.startsWith("/admin/access")) return "canManageAccess";
  if (pathname.startsWith("/admin/settings")) return "canManageSettings";
  if (pathname.startsWith("/admin/submissions")) return "canViewSubmissions";
  if (pathname.startsWith("/admin/careers")) return "canManageCareers";
  if (pathname.startsWith("/admin/content-calendar")) return "canManageContentCalendar";
  if (pathname.startsWith("/admin/ai-factory") || pathname.startsWith("/admin/ai-menu") || pathname.startsWith("/admin/ai-generate") || pathname.startsWith("/admin/ai-film") || pathname.startsWith("/admin/ai-chat") || pathname.startsWith("/admin/ai-gallery")) return "canUseAiTools";
  if (pathname.startsWith("/admin/client-projects")) return "canViewQuestionnaires";
  if (pathname.startsWith("/admin/monthly-intake")) return "canViewMonthlyIntake";
  if (pathname.startsWith("/admin/questionnaires")) return "canViewQuestionnaires";
  if (pathname === "/admin") return null;
  return "canManageWebsite";
}

export default function AdminAccessShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState<TeamAccount | null>(null);
  const [loading, setLoading] = useState(pathname !== "/admin/login");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const immersiveMobile = pathname.startsWith("/admin/ai-menu") || pathname.startsWith("/admin/ai-generate") || pathname.startsWith("/admin/ai-film") || pathname.startsWith("/admin/ai-chat") || pathname.startsWith("/admin/ai-gallery");

  const permission = useMemo(() => requiredPermission(pathname), [pathname]);

  useEffect(() => {
    const previous = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    const savedTheme = window.localStorage.getItem("astroshot-admin-theme") === "light" ? "light" : "dark";
    document.documentElement.dataset.adminTheme = savedTheme;
    setSidebarCollapsed(window.localStorage.getItem("astroshot-admin-sidebar") === "collapsed");
    return () => {
      window.history.scrollRestoration = previous;
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((collapsed) => {
      const next = !collapsed;
      window.localStorage.setItem("astroshot-admin-sidebar", next ? "collapsed" : "open");
      return next;
    });
  };

  useEffect(() => {
    if (pathname === "/admin/login") {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function checkAccess() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin/login");
        return;
      }

      const res = await fetch("/api/admin/me", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (!res.ok) {
        await supabase.auth.signOut();
        router.push("/admin/login");
        return;
      }

      const data = (await res.json()) as { account: TeamAccount; landing: string };
      if (cancelled) return;

      if (permission && !data.account.permissions[permission]) {
        router.replace(landingForPermissions(data.account.permissions));
        return;
      }

      if (permission === "canUseAiTools" && !canAccessAiRoute(data.account, pathname)) {
        router.replace(landingForAccount(data.account));
        return;
      }

      if (isCalendarScopedAccount(data.account)) {
        const allowed = normalizeAllowedCalendarSlugs(data.account.allowedCalendarSlugs);
        const calendarMatch = pathname.match(/^\/admin\/content-calendar(?:\/([^/]+))?$/);
        const calendarSlug = calendarMatch?.[1] ?? "";
        const isAllowedCalendarPath = Boolean(calendarSlug) && canAccessCalendarSlug(data.account, calendarSlug);
        if (!isAllowedCalendarPath) {
          router.replace(`/admin/content-calendar/${allowed[0]}`);
          return;
        }
      }

      if (pathname === "/admin") {
        router.replace(landingForAccount(data.account));
        return;
      }

      setAccount(data.account);
      setLoading(false);
    }

    checkAccess();
    return () => {
      cancelled = true;
    };
  }, [pathname, permission, router]);

  if (pathname === "/admin/login") return <>{children}</>;

  if (loading) {
    return <div className="min-h-screen bg-[#050505]" />;
  }

  return (
    <div
      className="admin-shell min-h-screen bg-[#050505]"
      style={{ fontFamily: "ui-sans-serif, -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif" }}
    >
      <AdminSidebar />
      <div className={`${sidebarCollapsed ? "lg:ml-16" : "lg:ml-60"} ${immersiveMobile ? "pt-0" : "pt-14 lg:pt-0"} min-h-screen transition-[margin] duration-200`}>
        {children}
      </div>
    </div>
  );
}
