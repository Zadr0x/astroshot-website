import { NextResponse } from "next/server";
import { canAccessCalendarSlug, getSupabaseServiceClient } from "@/lib/access-control";
import { requireTeamAccount } from "@/lib/admin-auth";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import {
  calendarStorageKey,
  normalizeCalendarSlug,
  parseContentCalendar,
  type CalendarCarouselItem,
} from "@/lib/content-calendar";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function canAccessPreview(session: { username: string; clientName: string }, slug: string) {
  const normalizedSlug = normalizeCalendarSlug(slug);
  return normalizeCalendarSlug(session.username) === normalizedSlug || normalizeCalendarSlug(session.clientName) === normalizedSlug;
}

export async function GET(request: Request, context: RouteContext) {
  const session = await getClientPortalSession();
  const { slug } = await context.params;
  const normalizedSlug = normalizeCalendarSlug(slug) || "lil-orbit";

  if (!session) {
    const { account, response } = await requireTeamAccount(request, "canViewQuestionnaires");
    if (response) return response;
    if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  } else if (!canAccessPreview(session, normalizedSlug)) {
    const { account, response } = await requireTeamAccount(request, "canViewQuestionnaires");
    if (response) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    if (account && !canAccessCalendarSlug(account, normalizedSlug)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const url = new URL(request.url);
  const postId = url.searchParams.get("postId") ?? "";
  const highlightId = url.searchParams.get("highlightId") ?? "";
  const asset = url.searchParams.get("asset") ?? "media";
  const slideParam = url.searchParams.get("slide");
  if (!postId && !highlightId) return NextResponse.json({ error: "Missing media ID" }, { status: 400 });

  const client = getSupabaseServiceClient();
  const { data, error } = await client
    .from("site_content")
    .select("value")
    .eq("key", calendarStorageKey(normalizedSlug))
    .maybeSingle();

  if (error) {
    console.error("Client preview download read failed:", error.message);
    return NextResponse.json({ error: "Could not load preview" }, { status: 500 });
  }

  const calendar = parseContentCalendar(data?.value, normalizedSlug);
  if (highlightId) {
    const highlight = calendar.highlights.find((item) => item.id === highlightId);
    if (!highlight) {
      return NextResponse.json({ error: "Highlight not found" }, { status: 404 });
    }

    return downloadSingleFile({
      sourceUrl: highlight.iconUrl,
      requestUrl: request.url,
      fileName: `${safeFilePart(calendar.clientName || calendar.slug)}-highlight-${safeFilePart(highlight.label || "highlight")}`,
      errorPrefix: "Client preview highlight download failed:",
    });
  }

  const post = calendar.posts.find((item) => item.id === postId);
  if (!post) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (asset === "thumbnail") {
    if (post.mediaType !== "video" || !post.thumbnailUrl) {
      return NextResponse.json({ error: "Thumbnail not found" }, { status: 404 });
    }

    return downloadSingleFile({
      sourceUrl: post.thumbnailUrl,
      requestUrl: request.url,
      fileName: `${safeFilePart(calendar.clientName || calendar.slug)}-${safeFilePart(post.label)}-thumbnail`,
      errorPrefix: "Client preview thumbnail download failed:",
    });
  }

  if (post.mediaType !== "carousel") {
    const mediaUrl = downloadMediaUrl(post.mediaType, post.originalMediaUrl, post.mediaUrl);
    if (!mediaUrl) return NextResponse.json({ error: "Media not found" }, { status: 404 });

    return downloadSingleFile({
      sourceUrl: mediaUrl,
      requestUrl: request.url,
      fileName: `${safeFilePart(calendar.clientName || calendar.slug)}-${safeFilePart(post.label)}`,
      errorPrefix: "Client preview media download failed:",
    });
  }

  const carouselItems = post.carouselItems.length > 0
    ? post.carouselItems
    : [{
        id: post.id,
        url: post.mediaUrl,
        originalUrl: post.originalMediaUrl || post.mediaUrl,
        thumbnailUrl: post.thumbnailUrl,
        mediaType: isVideoUrl(post.originalMediaUrl || post.mediaUrl) ? "video" : "image",
        createdAt: post.publishDate,
      }] satisfies CalendarCarouselItem[];

  if (slideParam) {
    const slideIndex = Number(slideParam);
    if (!Number.isInteger(slideIndex) || slideIndex < 0 || slideIndex >= carouselItems.length) {
      return NextResponse.json({ error: "Slide not found" }, { status: 404 });
    }

    const item = carouselItems[slideIndex];
    const itemUrl = downloadMediaUrl(item.mediaType, item.originalUrl, item.url);
    if (!itemUrl) return NextResponse.json({ error: "Slide media not found" }, { status: 404 });

    return downloadSingleFile({
      sourceUrl: itemUrl,
      requestUrl: request.url,
      fileName: `${safeFilePart(calendar.clientName || calendar.slug)}-${safeFilePart(post.label)}-slide-${String(slideIndex + 1).padStart(2, "0")}`,
      errorPrefix: "Client preview carousel slide download failed:",
    });
  }

  let files: Array<{ name: string; bytes: Uint8Array }>;
  try {
    files = [];
    for (let index = 0; index < carouselItems.length; index += 1) {
      const item = carouselItems[index];
      const itemUrl = downloadMediaUrl(item.mediaType, item.originalUrl, item.url);
      if (!itemUrl) throw new Error(`Slide ${index + 1} has no media URL`);
      const sourceUrl = absoluteUrl(itemUrl, request.url);
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Slide ${index + 1} failed with ${response.status}`);
      const bytes = new Uint8Array(await response.arrayBuffer());
      const contentType = response.headers.get("content-type") ?? "";
      files.push({
        name: `${String(index + 1).padStart(2, "0")}-${safeFilePart(post.label)}${extensionFor(sourceUrl, contentType)}`,
        bytes,
      });
    }
  } catch (downloadError) {
    console.error("Client preview carousel download failed:", downloadError);
    return NextResponse.json({ error: "Could not prepare carousel download" }, { status: 500 });
  }

  const zip = createZip(files);
  const fileName = `${safeFilePart(calendar.clientName || calendar.slug)}-${safeFilePart(post.label)}-carousel.zip`;

  return new Response(zip, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${fileName}"`,
      "Content-Length": String(zip.length),
      "Cache-Control": "private, no-store",
    },
  });
}

async function downloadSingleFile({
  sourceUrl,
  requestUrl,
  fileName,
  errorPrefix,
}: {
  sourceUrl: string;
  requestUrl: string;
  fileName: string;
  errorPrefix: string;
}) {
  if (!sourceUrl) return NextResponse.json({ error: "Media not found" }, { status: 404 });

  try {
    const absoluteSourceUrl = absoluteUrl(sourceUrl, requestUrl);
    const response = await fetch(absoluteSourceUrl);
    if (!response.ok) throw new Error(`Media failed with ${response.status}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const contentType = response.headers.get("content-type") ?? fallbackContentType(absoluteSourceUrl);

    return new Response(bytes, {
      headers: {
        "Content-Type": contentType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${fileName}${extensionFor(absoluteSourceUrl, contentType)}"`,
        "Content-Length": String(bytes.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (downloadError) {
    console.error(errorPrefix, downloadError);
    return NextResponse.json({ error: "Could not prepare media download" }, { status: 500 });
  }
}

function safeFilePart(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "content";
}

function absoluteUrl(sourceUrl: string, requestUrl: string) {
  return new URL(sourceUrl, requestUrl).toString();
}

function isVideoUrl(sourceUrl?: string) {
  if (!sourceUrl) return false;
  try {
    return /\.(mp4|mov)(?:$|[?#])/i.test(new URL(sourceUrl).pathname);
  } catch {
    return /\.(mp4|mov)(?:$|[?#])/i.test(sourceUrl);
  }
}

function downloadMediaUrl(mediaType: string, originalMediaUrl?: string, mediaUrl?: string) {
  if (mediaType === "video") {
    if (isVideoUrl(originalMediaUrl)) return originalMediaUrl;
    if (isVideoUrl(mediaUrl)) return mediaUrl;
  }
  return originalMediaUrl || mediaUrl;
}

function extensionFor(sourceUrl: string, contentType: string) {
  try {
    const pathname = new URL(sourceUrl).pathname.toLowerCase();
    const match = pathname.match(/\.(jpg|jpeg|png|webp|gif|heic|mp4|mov)$/);
    if (match) return `.${match[1]}`;
  } catch {
    // Fall back to content type below.
  }
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("webp")) return ".webp";
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("heic")) return ".heic";
  if (contentType.includes("mp4")) return ".mp4";
  if (contentType.includes("quicktime")) return ".mov";
  return ".jpg";
}

function fallbackContentType(sourceUrl: string) {
  try {
    const pathname = new URL(sourceUrl).pathname.toLowerCase();
    if (pathname.endsWith(".mp4")) return "video/mp4";
    if (pathname.endsWith(".mov")) return "video/quicktime";
    if (pathname.endsWith(".png")) return "image/png";
    if (pathname.endsWith(".webp")) return "image/webp";
    if (pathname.endsWith(".gif")) return "image/gif";
    if (pathname.endsWith(".heic")) return "image/heic";
  } catch {
    // Fall back to generic binary below.
  }
  return "application/octet-stream";
}

function createZip(files: Array<{ name: string; bytes: Uint8Array }>) {
  const localParts: Buffer[] = [];
  const centralParts: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const name = Buffer.from(file.name);
    const data = Buffer.from(file.bytes);
    const crc = crc32(data);
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(0, 10);
    localHeader.writeUInt16LE(0, 12);
    localHeader.writeUInt32LE(crc, 14);
    localHeader.writeUInt32LE(data.length, 18);
    localHeader.writeUInt32LE(data.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, data);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(0, 12);
    centralHeader.writeUInt16LE(0, 14);
    centralHeader.writeUInt32LE(crc, 16);
    centralHeader.writeUInt32LE(data.length, 20);
    centralHeader.writeUInt32LE(data.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE(0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + data.length;
  }

  const centralOffset = offset;
  const central = Buffer.concat(centralParts);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(files.length, 8);
  end.writeUInt16LE(files.length, 10);
  end.writeUInt32LE(central.length, 12);
  end.writeUInt32LE(centralOffset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...localParts, central, end]);
}

function crc32(input: Buffer) {
  let crc = 0xffffffff;
  for (const byte of input) {
    crc ^= byte;
    for (let index = 0; index < 8; index += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}
