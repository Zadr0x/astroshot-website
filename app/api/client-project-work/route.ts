import { NextResponse } from "next/server";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import { cleanModelSelection, readClientProjectWorkspace, saveClientProjectWorkspace } from "@/lib/client-project-work";

export async function GET() {
  const session = await getClientPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { workspace } = await readClientProjectWorkspace(session.username, session.clientName);
    return NextResponse.json({ workspace });
  } catch (error) {
    console.error("Client project workspace read failed:", error);
    return NextResponse.json({ error: "Could not load project workspace" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getClientPortalSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let payload: { ideaId?: string; itemId?: string; section?: string; decision?: string; comment?: string; type?: string; selectedModelIds?: string[]; notes?: string };
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (payload.type === "model-selection") {
    try {
      const { workspace } = await readClientProjectWorkspace(session.username, session.clientName);
      const saved = await saveClientProjectWorkspace({
        ...workspace,
        modelSelection: cleanModelSelection({
          selectedModelIds: payload.selectedModelIds ?? [],
          notes: payload.notes ?? "",
          submittedAt: new Date().toISOString(),
        }),
      });
      return NextResponse.json({ ok: true, workspace: saved });
    } catch (error) {
      console.error("Client model selection save failed:", error);
      return NextResponse.json({ error: "Could not save model selection" }, { status: 500 });
    }
  }

  if (payload.type === "visual-approval") {
    const itemId = payload.itemId?.trim();
    const section = payload.section === "locations" ? "locations" : payload.section === "outfits" ? "outfits" : "";
    const decision: "approved" | "revision" | null =
      payload.decision === "approved" || payload.decision === "revision" ? payload.decision : null;
    if (!itemId || !section || !decision) {
      return NextResponse.json({ error: "Choose an approval option" }, { status: 400 });
    }

    try {
      const { workspace } = await readClientProjectWorkspace(session.username, session.clientName);
      const key = section === "outfits" ? "outfitSelection" : "locationSelection";
      const found = workspace[key].items.some((item) => item.id === itemId);
      if (!found) return NextResponse.json({ error: "Selection option not found" }, { status: 404 });

      const saved = await saveClientProjectWorkspace({
        ...workspace,
        [key]: {
          ...workspace[key],
          items: workspace[key].items.map((item) =>
            item.id === itemId
              ? (() => {
                  const createdAt = new Date().toISOString();
                  const message = payload.comment?.trim() || (decision === "approved" ? "Approved" : "");
                  return {
                    ...item,
                    clientDecision: decision,
                    clientComment: payload.comment?.trim() || "",
                    clientRespondedAt: createdAt,
                    feedbackThread: message
                      ? [
                          ...(item.feedbackThread ?? []),
                          {
                            id: `client-${createdAt}`,
                            author: "client" as const,
                            message,
                            decision,
                            createdAt,
                          },
                        ]
                      : item.feedbackThread ?? [],
                    status: decision === "approved" ? "approved" as const : "revision" as const,
                  };
                })()
              : item
          ),
        },
      });
      return NextResponse.json({ ok: true, workspace: saved });
    } catch (error) {
      console.error("Client visual approval save failed:", error);
      return NextResponse.json({ error: "Could not save selection response" }, { status: 500 });
    }
  }

  const ideaId = payload.ideaId?.trim();
  const decision: "approved" | "revision" | null =
    payload.decision === "approved" || payload.decision === "revision" ? payload.decision : null;
  if (!ideaId || !decision) {
    return NextResponse.json({ error: "Choose an approval option" }, { status: 400 });
  }

  try {
    const { workspace } = await readClientProjectWorkspace(session.username, session.clientName);
    const found = workspace.ideaProposal.items.some((item) => item.id === ideaId);
    if (!found) return NextResponse.json({ error: "Idea not found" }, { status: 404 });

    const nextWorkspace = {
      ...workspace,
      ideaProposal: {
        ...workspace.ideaProposal,
        items: workspace.ideaProposal.items.map((item) =>
          item.id === ideaId
            ? (() => {
                const createdAt = new Date().toISOString();
                const message = payload.comment?.trim() || (decision === "approved" ? "Approved" : "");
                return {
                  ...item,
                  clientDecision: decision,
                  clientComment: payload.comment?.trim() || "",
                  clientRespondedAt: createdAt,
                  feedbackThread: message
                    ? [
                        ...(item.feedbackThread ?? []),
                        {
                          id: `client-${createdAt}`,
                          author: "client" as const,
                          message,
                          decision,
                          createdAt,
                        },
                      ]
                    : item.feedbackThread ?? [],
                  status: decision === "approved" ? "approved" as const : "revision" as const,
                };
              })()
            : item
        ),
      },
    };
    const saved = await saveClientProjectWorkspace(nextWorkspace);
    return NextResponse.json({ ok: true, workspace: saved });
  } catch (error) {
    console.error("Client project feedback save failed:", error);
    return NextResponse.json({ error: "Could not save feedback" }, { status: 500 });
  }
}
