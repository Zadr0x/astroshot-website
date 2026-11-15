import { NextResponse } from "next/server";
import { getTeamAccountFromRequest } from "@/lib/admin-auth";
import { landingForAccount } from "@/lib/access-control";

export async function GET(request: Request) {
  const account = await getTeamAccountFromRequest(request);

  if (!account) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    account,
    landing: landingForAccount(account),
  });
}
