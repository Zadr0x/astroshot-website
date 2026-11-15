import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import {
  getAccessConfig,
  getSupabaseServiceClient,
  normalizeRole,
  rolePermissions,
  saveAccessConfig,
  type ClientPortalAccount,
  type TeamAccount,
} from "@/lib/access-control";
import { hashPassword } from "@/lib/password";

type CreatePayload = {
  type?: "team" | "client";
  email?: string;
  username?: string;
  password?: string;
  name?: string;
  clientName?: string;
  role?: string;
  questionnaireType?: ClientPortalAccount["questionnaireType"];
};

export async function GET(request: Request) {
  const { response } = await requireTeamAccount(request, "canManageAccess");
  if (response) return response;

  const config = await getAccessConfig();
  return NextResponse.json({
    team: config.team.map((account) => ({
      ...account,
      passwordHash: undefined,
    })),
    clients: config.clients.map(({ passwordHash: _passwordHash, ...client }) => client),
  });
}

export async function POST(request: Request) {
  const { response } = await requireTeamAccount(request, "canManageAccess");
  if (response) return response;

  let payload: CreatePayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const password = payload.password?.trim() ?? "";
  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 });
  }

  const config = await getAccessConfig();

  if (payload.type === "team") {
    const email = payload.email?.trim().toLowerCase();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    const role = normalizeRole(payload.role ?? "account_manager");
    const client = getSupabaseServiceClient();
    const { data, error } = await client.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: payload.name?.trim() || email },
    });

    if (error || !data.user) {
      return NextResponse.json({ error: error?.message ?? "Could not create team user" }, { status: 400 });
    }

    const account: TeamAccount = {
      id: data.user.id,
      email,
      name: payload.name?.trim() || email,
      role,
      permissions: rolePermissions[role],
      active: true,
      createdAt: new Date().toISOString(),
    };

    await saveAccessConfig({
      ...config,
      team: [...config.team.filter((entry) => entry.email !== email), account],
    });

    return NextResponse.json({ account });
  }

  if (payload.type === "client") {
    const username = payload.username?.trim();
    if (!username) return NextResponse.json({ error: "Username is required" }, { status: 400 });

    const account: ClientPortalAccount = {
      username,
      clientName: payload.clientName?.trim() || username,
      passwordHash: hashPassword(password),
      active: true,
      createdAt: new Date().toISOString(),
      questionnaireType:
        payload.questionnaireType === "brand" ||
        payload.questionnaireType === "explanatory_animation" ||
        payload.questionnaireType === "media_buying_clinic"
          ? payload.questionnaireType
          : "standard",
    };

    await saveAccessConfig({
      ...config,
      clients: [...config.clients.filter((entry) => entry.username.toLowerCase() !== username.toLowerCase()), account],
    });

    return NextResponse.json({
      account: {
        username: account.username,
        clientName: account.clientName,
        questionnaireType: account.questionnaireType,
        active: account.active,
        createdAt: account.createdAt,
      },
    });
  }

  return NextResponse.json({ error: "Invalid account type" }, { status: 400 });
}
