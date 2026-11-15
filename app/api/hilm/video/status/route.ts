import { extractFalVideoUrl, getFalResult, getFalStatus } from "@/lib/fal-video";
import { jsonWithCors, optionsWithCors } from "@/lib/hilm-cors";

export const OPTIONS = optionsWithCors;

function text(value: unknown) {
  return String(value ?? "").trim();
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const endpointId = text(url.searchParams.get("endpointId"));
  const requestId = text(url.searchParams.get("requestId"));
  const statusUrl = text(url.searchParams.get("statusUrl"));
  const responseUrl = text(url.searchParams.get("responseUrl"));

  if (!endpointId || !requestId) {
    return jsonWithCors({ error: "Missing video job details" }, { status: 400 });
  }

  try {
    const status = await getFalStatus(endpointId, requestId, statusUrl);
    const state = text(status.status).toUpperCase();
    if (state === "COMPLETED") {
      const result = await getFalResult(endpointId, requestId, responseUrl);
      return jsonWithCors({
        status: state,
        videoUrl: extractFalVideoUrl(result),
        logs: status.logs ?? [],
      });
    }

    return jsonWithCors({
      status: state || "IN_QUEUE",
      logs: status.logs ?? [],
    });
  } catch (error) {
    return jsonWithCors({ error: error instanceof Error ? error.message : "Could not read video status" }, { status: 500 });
  }
}
