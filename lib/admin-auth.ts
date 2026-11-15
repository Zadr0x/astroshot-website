import { NextResponse } from "next/server";
import {
  canAccessAiRoute,
  getAccessConfig,
  getDefaultAdminAccount,
  getSupabaseServiceClient,
  saveAccessConfig,
  type TeamAccount,
} from "@/lib/access-control";

export async function getTeamAccountFromRequest(request: Request): Promise<TeamAccount | null> {
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length) : null;
  if (!token) return null;

  const client = getSupabaseServiceClient();
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;

  const config = await getAccessConfig();
  const account = config.team.find((entry) => entry.id === data.user.id || entry.email.toLowerCase() === data.user.email?.toLowerCase());

  if (account) {
    return account.active ? account : null;
  }

  if (config.team.length === 0) {
    const admin = getDefaultAdminAccount(data.user);
    await saveAccessConfig({ ...config, team: [admin] });
    return admin;
  }

  return null;
}

export async function requireTeamAccount(request: Request, permission?: keyof TeamAccount["permissions"]) {
  const account = await getTeamAccountFromRequest(request);
  if (!account) {
    return { account: null, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (permission && !account.permissions[permission]) {
    return { account, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }

  if (permission === "canUseAiTools") {
    const pathname = new URL(request.url).pathname;
    const normalizedPathname = pathname.startsWith("/api/admin/ai-factory")
      ? "/admin/ai-factory"
      : pathname.startsWith("/api/admin/content-calendar")
        ? "/admin/content-calendar"
        : pathname.replace(/^\/api\/admin/, "/admin");
    if (!canAccessAiRoute(account, normalizedPathname)) {
      return { account, response: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
    }
  }

  return { account, response: null };
}
