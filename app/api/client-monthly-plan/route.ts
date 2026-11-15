import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import type { MonthlyProductFocus } from "@/lib/client-questionnaire";

type MonthlyPlanPayload = {
  month?: string;
  products?: MonthlyProductFocus[];
  calendarNotes?: { date?: string; note?: string }[];
  notes?: string;
  autosave?: boolean;
};

const SERVICE_NAME = "Monthly Content Intake";
const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");

function cleanProduct(product: MonthlyProductFocus): MonthlyProductFocus {
  return {
    name: trim(product.name),
    type: trim(product.type) || "Product",
    priority: trim(product.priority) || "Hero focus",
    objective: trim(product.objective),
    details: trim(product.details),
    offer: trim(product.offer),
    keyDate: trim(product.keyDate),
    assetNotes: trim(product.assetNotes),
    files: Array.isArray(product.files) ? product.files : [],
  };
}

function getStorageClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

export async function GET(request: Request) {
  const session = await getClientPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const month = new URL(request.url).searchParams.get("month")?.trim() ?? "";

  const supabase = getStorageClient();
  if (!supabase) {
    return NextResponse.json({ error: "Monthly intake storage is not configured" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("contact_submissions")
    .select("id,message,created_at")
    .eq("service", SERVICE_NAME)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Client monthly plan read failed:", error);
    return NextResponse.json({ error: "Could not load monthly plan" }, { status: 500 });
  }

  const latest = (data ?? []).find((row) => {
    try {
      const parsed = JSON.parse(row.message);
      return parsed?.submittedBy === session.username && (!month || parsed?.monthlyPlan?.month === month);
    } catch {
      return false;
    }
  });

  if (!latest) {
    return NextResponse.json({ monthlyPlan: null });
  }

  try {
    const parsed = JSON.parse(latest.message);
    return NextResponse.json({ monthlyPlan: parsed.monthlyPlan ?? null, submittedAt: parsed.submittedAt ?? latest.created_at });
  } catch {
    return NextResponse.json({ monthlyPlan: null });
  }
}

export async function POST(request: Request) {
  const session = await getClientPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: MonthlyPlanPayload;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const monthlyPlan = {
    month: trim(payload.month) || "July 2026",
    products: (payload.products ?? []).map(cleanProduct).filter((product) => product.name),
    calendarNotes: (payload.calendarNotes ?? [])
      .map((item) => ({ date: trim(item.date), note: trim(item.note) }))
      .filter((item) => item.date && item.note),
    notes: trim(payload.notes),
  };

  if (monthlyPlan.products.length === 0 && monthlyPlan.calendarNotes.length === 0 && !monthlyPlan.notes) {
    return NextResponse.json({ error: "Add at least one product, service, or calendar note" }, { status: 400 });
  }

  const supabase = getStorageClient();
  if (!supabase) {
    return NextResponse.json({ error: "Monthly intake storage is not configured" }, { status: 500 });
  }

  const message = JSON.stringify(
    {
      type: "client_monthly_plan",
      submittedBy: session.username,
      clientName: session.clientName,
      submittedAt: new Date().toISOString(),
      monthlyPlan,
    },
    null,
    2
  );

  const { data: existingRows, error: readError } = await supabase
    .from("contact_submissions")
    .select("id,message")
    .eq("service", SERVICE_NAME)
    .order("created_at", { ascending: false })
    .limit(50);

  if (readError) {
    console.error("Client monthly plan lookup failed:", readError);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  const existing = (existingRows ?? []).find((row) => {
    try {
      const parsed = JSON.parse(row.message);
      return parsed?.submittedBy === session.username && parsed?.monthlyPlan?.month === monthlyPlan.month;
    } catch {
      return false;
    }
  });

  const writePayload = {
    name: session.clientName,
    company: session.clientName,
    service: SERVICE_NAME,
    message,
    status: "new",
  };

  const { error } = existing
    ? await supabase.from("contact_submissions").update(writePayload).eq("id", existing.id)
    : await supabase.from("contact_submissions").insert(writePayload);

  if (error) {
    console.error("Client monthly plan failed:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, monthlyPlan });
}
