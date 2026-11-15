import { createClient } from "@supabase/supabase-js";

export type TeamRole = "admin" | "team_manager" | "account_manager" | "website_content";

export type TeamPermissions = {
  canManageAccess: boolean;
  canViewQuestionnaires: boolean;
  canViewMonthlyIntake: boolean;
  canManageContentCalendar: boolean;
  canViewSubmissions: boolean;
  canManageCareers: boolean;
  canUseAiTools: boolean;
  canManageWebsite: boolean;
  canManageSettings: boolean;
};

export type TeamAccount = {
  id: string;
  email: string;
  name: string;
  role: TeamRole;
  permissions: TeamPermissions;
  allowedCalendarSlugs?: string[];
  allowedAiRoutes?: string[];
  active: boolean;
  createdAt: string;
};

export type ClientPortalAccount = {
  username: string;
  clientName: string;
  passwordHash: string;
  active: boolean;
  createdAt: string;
  questionnaireType?: "standard" | "brand" | "explanatory_animation" | "media_buying_clinic";
};

export type AccessConfig = {
  team: TeamAccount[];
  clients: ClientPortalAccount[];
};

export const ACCESS_CONFIG_KEY = "access_control_config";

export const rolePermissions: Record<TeamRole, TeamPermissions> = {
  admin: {
    canManageAccess: true,
    canViewQuestionnaires: true,
    canViewMonthlyIntake: true,
    canManageContentCalendar: true,
    canViewSubmissions: true,
    canManageCareers: true,
    canUseAiTools: true,
    canManageWebsite: true,
    canManageSettings: true,
  },
  team_manager: {
    canManageAccess: true,
    canViewQuestionnaires: true,
    canViewMonthlyIntake: true,
    canManageContentCalendar: true,
    canViewSubmissions: true,
    canManageCareers: true,
    canUseAiTools: false,
    canManageWebsite: false,
    canManageSettings: false,
  },
  account_manager: {
    canManageAccess: false,
    canViewQuestionnaires: true,
    canViewMonthlyIntake: false,
    canManageContentCalendar: true,
    canViewSubmissions: false,
    canManageCareers: false,
    canUseAiTools: false,
    canManageWebsite: false,
    canManageSettings: false,
  },
  website_content: {
    canManageAccess: false,
    canViewQuestionnaires: false,
    canViewMonthlyIntake: false,
    canManageContentCalendar: false,
    canViewSubmissions: false,
    canManageCareers: false,
    canUseAiTools: false,
    canManageWebsite: true,
    canManageSettings: false,
  },
};

export const roleLabels: Record<TeamRole, string> = {
  admin: "Admin",
  team_manager: "Team Manager",
  account_manager: "Account Manager",
  website_content: "Website Content",
};

export function normalizeRole(role: string): TeamRole {
  if (role === "operations_manager" || role === "team_manager") return "team_manager";
  if (role === "account_manager" || role === "website_content") return role;
  return "admin";
}

export function normalizePermissions(role: TeamRole, permissions?: Partial<TeamPermissions>): TeamPermissions {
  return {
    ...rolePermissions[role],
    ...(permissions ?? {}),
  };
}

export function getSupabaseServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
    { auth: { persistSession: false } }
  );
}

export async function getAccessConfig(): Promise<AccessConfig> {
  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", ACCESS_CONFIG_KEY)
    .maybeSingle();

  if (error) {
    console.error("Access config read failed:", error.message);
  }

  if (!data?.value) {
    return { team: [], clients: [] };
  }

  try {
    const parsed = JSON.parse(data.value) as AccessConfig;
    return {
      team: Array.isArray(parsed.team) ? parsed.team.map((account) => ({
        ...account,
        role: normalizeRole(account.role),
        permissions: normalizePermissions(normalizeRole(account.role), account.permissions),
        allowedCalendarSlugs: normalizeAllowedCalendarSlugs(account.allowedCalendarSlugs),
        allowedAiRoutes: normalizeAllowedAiRoutes(account.allowedAiRoutes),
      })) : [],
      clients: Array.isArray(parsed.clients) ? parsed.clients : [],
    };
  } catch {
    return { team: [], clients: [] };
  }
}

export async function saveAccessConfig(config: AccessConfig) {
  const client = getSupabaseServiceClient();
  const value = JSON.stringify(config);
  const { error } = await client.from("site_content").upsert({
    key: ACCESS_CONFIG_KEY,
    value,
    label: "Access Control Config",
    section: "system",
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (error) throw error;
}

export function getDefaultAdminAccount(user: { id: string; email?: string | null }): TeamAccount {
  return {
    id: user.id,
    email: user.email ?? "",
    name: "Astroshot Admin",
    role: "admin",
    permissions: rolePermissions.admin,
    active: true,
    createdAt: new Date().toISOString(),
  };
}

export function normalizeAllowedCalendarSlugs(slugs?: string[]) {
  return Array.from(new Set((slugs ?? []).map((slug) => slug.trim().toLowerCase()).filter(Boolean)));
}

export function isCalendarScopedAccount(account: TeamAccount) {
  return normalizeAllowedCalendarSlugs(account.allowedCalendarSlugs).length > 0;
}

export function canAccessCalendarSlug(account: TeamAccount, slug: string) {
  const allowed = normalizeAllowedCalendarSlugs(account.allowedCalendarSlugs);
  return allowed.length === 0 || allowed.includes(slug.trim().toLowerCase());
}

export function canUseContentCalendarAi(account: TeamAccount, slug: string) {
  if (account.permissions.canUseAiTools) return true;
  return account.permissions.canManageContentCalendar && canAccessCalendarSlug(account, slug);
}

export function normalizeAllowedAiRoutes(routes?: string[]) {
  return Array.from(new Set((routes ?? []).map((route) => route.trim()).filter(Boolean)));
}

export function canAccessAiRoute(account: TeamAccount, pathname: string) {
  const allowed = normalizeAllowedAiRoutes(account.allowedAiRoutes);
  if (allowed.length === 0) return true;
  return allowed.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function landingForAccount(account: TeamAccount) {
  const allowed = normalizeAllowedCalendarSlugs(account.allowedCalendarSlugs);
  if (allowed.length > 0) return `/admin/content-calendar/${allowed[0]}`;
  return landingForPermissions(account.permissions);
}

export function landingForPermissions(permissions: TeamPermissions) {
  if (permissions.canManageAccess) return "/admin/access";
  if (permissions.canViewQuestionnaires) return "/admin/questionnaires";
  if (permissions.canManageContentCalendar) return "/admin/content-calendar";
  if (permissions.canUseAiTools) return "/admin/ai-factory";
  if (permissions.canManageWebsite) return "/admin/content";
  return "/admin/login";
}
