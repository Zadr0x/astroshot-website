import { cookies } from "next/headers";
import { getAccessConfig } from "@/lib/access-control";
import { verifyPassword } from "@/lib/password";

const COOKIE_NAME = "astroshot_client_portal";
const DEFAULT_USER = "client";
const DEFAULT_PASSWORD = "AstroshotClient2026!";

type PortalUser = {
  username: string;
  password: string;
  clientName?: string;
};

export type ClientPortalSession = {
  username: string;
  clientName: string;
  questionnaireType: "standard" | "brand" | "explanatory_animation" | "media_buying_clinic";
};

function getPortalUsers(): PortalUser[] {
  if (process.env.CLIENT_PORTAL_USERS) {
    try {
      const parsed = JSON.parse(process.env.CLIENT_PORTAL_USERS) as PortalUser[];
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    } catch {
      console.error("CLIENT_PORTAL_USERS is not valid JSON");
    }
  }

  return [
    {
      username: process.env.CLIENT_PORTAL_USERNAME ?? DEFAULT_USER,
      password: process.env.CLIENT_PORTAL_PASSWORD ?? DEFAULT_PASSWORD,
      clientName: process.env.CLIENT_PORTAL_CLIENT_NAME ?? "Astroshot Client",
    },
  ];
}

function encodeSession(username: string) {
  return Buffer.from(`${username}:${process.env.CLIENT_PORTAL_SESSION_SECRET ?? "astroshot-client-portal"}`).toString("base64url");
}

export async function getClientPortalSession(): Promise<ClientPortalSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const config = await getAccessConfig();
  const dbUser = config.clients.find((entry) => entry.active && encodeSession(entry.username) === token);
  if (dbUser) {
    return {
      username: dbUser.username,
      clientName: dbUser.clientName,
      questionnaireType: dbUser.questionnaireType ?? "standard",
    };
  }

  const user = getPortalUsers().find((entry) => encodeSession(entry.username) === token);
  if (!user) return null;

  return {
    username: user.username,
    clientName: user.clientName ?? user.username,
    questionnaireType: "standard",
  };
}

export async function setClientPortalSession(username: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, encodeSession(username), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 14,
  });
}

export async function clearClientPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function validateClientPortalLogin(
  username: string,
  password: string
): Promise<ClientPortalSession | null> {
  const config = await getAccessConfig();
  const dbUser = config.clients.find((entry) => entry.active && entry.username.toLowerCase() === username.toLowerCase());

  if (dbUser && verifyPassword(password, dbUser.passwordHash)) {
    return {
      username: dbUser.username,
      clientName: dbUser.clientName,
      questionnaireType: dbUser.questionnaireType ?? "standard",
    };
  }

  const user = getPortalUsers().find(
    (entry) => entry.username.toLowerCase() === username.toLowerCase() && entry.password === password
  );

  if (!user) return null;

  return {
    username: user.username,
    clientName: user.clientName ?? user.username,
    questionnaireType: "standard",
  };
}
