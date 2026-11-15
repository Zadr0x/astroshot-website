import { NextResponse } from "next/server";
import { requireTeamAccount } from "@/lib/admin-auth";
import { uploadFileAdmin } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  const { response } = await requireTeamAccount(request, "canViewQuestionnaires");
  if (response) return response;

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file selected" }, { status: 400 });
  }

  if (file.size > 250 * 1024 * 1024) {
    return NextResponse.json({ error: "File is larger than 250MB" }, { status: 400 });
  }

  const url = await uploadFileAdmin(file, "client-brand-assets");
  if (!url) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }

  return NextResponse.json({
    file: {
      name: file.name,
      url,
      type: file.type || "application/octet-stream",
      size: file.size,
    },
  });
}
