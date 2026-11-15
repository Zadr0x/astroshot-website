import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { getAccessConfig, getSupabaseServiceClient } from "@/lib/access-control";
import {
  cleanBrandIdentitySection,
  cleanContentBriefSection,
  cleanIdeaItem,
  cleanModelSelection,
  cleanMoodboardImage,
  cleanTimelineItem,
  cleanVisualApprovalSection,
  emptyClientProjectWorkspace,
  readClientProjectWorkspace,
  saveClientProjectWorkspace,
  type ClientProjectWorkspace,
} from "@/lib/client-project-work";
import { parseContentCalendar } from "@/lib/content-calendar";

type RelatedSubmission = {
  id: string;
  createdAt: string;
  status: string;
  parsed: unknown;
};

function normalizeMatch(value: string) {
  return value.trim().toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "");
}

function parseSubmission(row: { id: string; message: string | null; created_at: string; status: string | null }): RelatedSubmission | null {
  try {
    return {
      id: row.id,
      createdAt: row.created_at,
      status: row.status ?? "new",
      parsed: row.message ? JSON.parse(row.message) : null,
    };
  } catch {
    return null;
  }
}

async function getClientProjectRelatedData(clientUsername: string, clientName: string) {
  const supabase = getSupabaseServiceClient();
  const matchValues = new Set([normalizeMatch(clientUsername), normalizeMatch(clientName)].filter(Boolean));

  const { data: submissions, error: submissionsError } = await supabase
    .from("contact_submissions")
    .select("id,service,message,created_at,status,company,name")
    .in("service", ["Client Questionnaire", "Monthly Content Intake"])
    .order("created_at", { ascending: false })
    .limit(200);

  if (submissionsError) throw submissionsError;

  const questionnaire = ((submissions ?? []) as Array<{ id: string; service: string; message: string | null; created_at: string; status: string | null; company: string | null; name: string | null }>)
    .filter((row) => row.service === "Client Questionnaire")
    .map((row) => ({ row, parsed: parseSubmission(row) }))
    .find(({ row, parsed }) => {
      const payload = parsed?.parsed as { submittedBy?: string; questionnaire?: { identity?: { businessName?: string } } } | null;
      return [
        row.company ?? "",
        row.name ?? "",
        payload?.submittedBy ?? "",
        payload?.questionnaire?.identity?.businessName ?? "",
      ].some((value) => matchValues.has(normalizeMatch(value)));
    })?.parsed ?? null;

  const monthlyIntakes = ((submissions ?? []) as Array<{ id: string; service: string; message: string | null; created_at: string; status: string | null; company: string | null; name: string | null }>)
    .filter((row) => row.service === "Monthly Content Intake")
    .map((row) => ({ row, parsed: parseSubmission(row) }))
    .filter(({ row, parsed }) => {
      const payload = parsed?.parsed as { submittedBy?: string; clientName?: string } | null;
      return [
        row.company ?? "",
        row.name ?? "",
        payload?.submittedBy ?? "",
        payload?.clientName ?? "",
      ].some((value) => matchValues.has(normalizeMatch(value)));
    })
    .map(({ parsed }) => parsed)
    .filter(Boolean)
    .slice(0, 12);

  const { data: calendarRows, error: calendarsError } = await supabase
    .from("site_content")
    .select("key,value,updated_at")
    .eq("section", "content-calendar")
    .order("updated_at", { ascending: false });

  if (calendarsError) throw calendarsError;

  const calendars = ((calendarRows ?? []) as Array<{ key: string; value: string | null; updated_at: string | null }>)
    .filter((row) => row.key.startsWith("content_calendar_"))
    .map((row) => {
      const slug = row.key.replace(/^content_calendar_/, "");
      const calendar = parseContentCalendar(row.value, slug);
      return {
        slug: calendar.slug,
        clientName: calendar.clientName,
        campaignTitle: calendar.campaignTitle,
        totalPosts: calendar.posts.length,
        filledPosts: calendar.posts.filter((post) => Boolean(post.mediaUrl)).length,
        updatedAt: calendar.updatedAt || row.updated_at || "",
      };
    })
    .filter((calendar) => [calendar.clientName, calendar.slug].some((value) => matchValues.has(normalizeMatch(value))));

  return { questionnaire, monthlyIntakes, calendars };
}

export async function GET(request: Request) {
  const { response } = await requireTeamAccount(request, "canViewQuestionnaires");
  if (response) return response;

  const config = await getAccessConfig();
  const clients = config.clients.filter((client) => client.active);
  const username = new URL(request.url).searchParams.get("client")?.trim() || clients[0]?.username || "";
  const client = clients.find((entry) => entry.username === username);

  if (!client) {
    return NextResponse.json({ clients, workspace: null });
  }

  try {
    const { workspace } = await readClientProjectWorkspace(client.username, client.clientName);
    const related = await getClientProjectRelatedData(client.username, client.clientName);
    return NextResponse.json({ clients, workspace, related });
  } catch (error) {
    console.error("Admin client project workspace read failed:", error);
    return NextResponse.json({ error: "Could not load project workspace" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { response } = await requireTeamAccount(request, "canViewQuestionnaires");
  if (response) return response;

  const config = await getAccessConfig();

  let payload: Partial<ClientProjectWorkspace>;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const clientUsername = payload.clientUsername?.trim() ?? "";
  const client = config.clients.find((entry) => entry.active && entry.username === clientUsername);
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  const workspace: ClientProjectWorkspace = {
    ...emptyClientProjectWorkspace(client.username, client.clientName),
    ...payload,
    type: "client_project_workspace",
    clientUsername: client.username,
    clientName: client.clientName,
    updatedAt: new Date().toISOString(),
    ideaProposal: {
      title: payload.ideaProposal?.title ?? "Idea Proposal",
      intro: payload.ideaProposal?.intro ?? "",
      moodboard: (payload.ideaProposal?.moodboard ?? []).map(cleanMoodboardImage).filter((item) => item.url),
      items: (payload.ideaProposal?.items ?? []).map(cleanIdeaItem),
    },
    modelSelection: cleanModelSelection(payload.modelSelection),
    brandIdentity: cleanBrandIdentitySection(payload.brandIdentity),
    contentBrief: cleanContentBriefSection(payload.contentBrief),
    outfitSelection: cleanVisualApprovalSection(payload.outfitSelection, "Outfit Selection"),
    locationSelection: cleanVisualApprovalSection(payload.locationSelection, "Location Selection"),
    timeline: {
      title: payload.timeline?.title ?? "Project Timeline",
      items: (payload.timeline?.items ?? []).map(cleanTimelineItem),
    },
  };

  try {
    const saved = await saveClientProjectWorkspace(workspace);
    return NextResponse.json({ ok: true, workspace: saved });
  } catch (error) {
    console.error("Admin client project workspace save failed:", error);
    return NextResponse.json({ error: "Could not save project workspace" }, { status: 500 });
  }
}
