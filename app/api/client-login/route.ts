import { NextResponse } from "next/server";
import { setClientPortalSession, validateClientPortalLogin } from "@/lib/client-portal-auth";

type LoginPayload = {
  username?: string;
  password?: string;
};

export async function POST(request: Request) {
  let payload: LoginPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const username = payload.username?.trim() ?? "";
  const password = payload.password ?? "";
  const user = await validateClientPortalLogin(username, password);

  if (!user) {
    return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
  }

  await setClientPortalSession(user.username);
  return NextResponse.json({ ok: true, clientName: user.clientName });
}
