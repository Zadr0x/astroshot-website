import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getClientPortalSession } from "@/lib/client-portal-auth";
import {
  summarizeBrandQuestionnaire,
  summarizeExplanatoryAnimationQuestionnaire,
  summarizeMediaBuyingClinicQuestionnaire,
  summarizeQuestionnaire,
  type BrandQuestionnairePayload,
  type ExplanatoryAnimationQuestionnairePayload,
  type MediaBuyingClinicQuestionnairePayload,
  type QuestionnairePayload,
  type QuestionnaireType,
} from "@/lib/client-questionnaire";

type SubmissionPayload = {
  questionnaireType?: QuestionnaireType;
  questionnaire?:
    | QuestionnairePayload
    | BrandQuestionnairePayload
    | ExplanatoryAnimationQuestionnairePayload
    | MediaBuyingClinicQuestionnairePayload;
  autosave?: boolean;
};

const trim = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const DRAFT_SERVICE_NAME = "Client Questionnaire Draft";

function parseMessage(message: string) {
  try {
    return JSON.parse(message) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await getClientPortalSession();
  if (!session) {
    return NextResponse.json({
      authenticated: false,
      clientName: null,
      questionnaireSubmitted: false,
      questionnaireType: "standard",
    });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      authenticated: true,
      clientName: session.clientName,
      questionnaireSubmitted: false,
      questionnaireType: session.questionnaireType ?? "standard",
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data } = await supabase
    .from("contact_submissions")
    .select("message,service,created_at")
    .in("service", ["Client Questionnaire", DRAFT_SERVICE_NAME])
    .order("created_at", { ascending: false })
    .limit(150);

  const questionnaireSubmitted = (data ?? []).some((row) => {
    if (row.service !== "Client Questionnaire") return false;
    const parsed = parseMessage(row.message);
    return parsed?.submittedBy === session.username;
  });

  const draftRow = (data ?? []).find((row) => {
    if (row.service !== DRAFT_SERVICE_NAME) return false;
    const parsed = parseMessage(row.message);
    return parsed?.submittedBy === session.username;
  });
  const draft = draftRow ? parseMessage(draftRow.message) : null;

  return NextResponse.json({
    authenticated: true,
    clientName: session.clientName,
    questionnaireSubmitted,
    questionnaireType: session.questionnaireType ?? "standard",
    questionnaireDraft: draft?.questionnaire ?? null,
    questionnaireDraftType: draft?.questionnaireType ?? null,
    questionnaireDraftSavedAt: draft?.savedAt ?? null,
  });
}

export async function POST(request: Request) {
  const session = await getClientPortalSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: SubmissionPayload;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const questionnaire = payload.questionnaire;
  if (!questionnaire) {
    return NextResponse.json({ error: "Missing questionnaire" }, { status: 400 });
  }

  const type: QuestionnaireType = payload.questionnaireType ?? session.questionnaireType ?? "standard";

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Questionnaire storage is not configured" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  if (payload.autosave) {
    const message = JSON.stringify(
      {
        type: "client_questionnaire_draft",
        questionnaireType: type,
        submittedBy: session.username,
        clientName: session.clientName,
        savedAt: new Date().toISOString(),
        questionnaire,
      },
      null,
      2
    );

    const { data: existingRows, error: readError } = await supabase
      .from("contact_submissions")
      .select("id,message")
      .eq("service", DRAFT_SERVICE_NAME)
      .order("created_at", { ascending: false })
      .limit(50);

    if (readError) {
      console.error("Client questionnaire draft lookup failed:", readError);
      return NextResponse.json({ error: "Autosave failed" }, { status: 500 });
    }

    const existing = (existingRows ?? []).find((row) => {
      const parsed = parseMessage(row.message);
      return parsed?.submittedBy === session.username && parsed?.questionnaireType === type;
    });

    const writePayload = {
      name: session.clientName,
      company: session.clientName,
      service: DRAFT_SERVICE_NAME,
      message,
      status: "new",
    };

    const { error } = existing
      ? await supabase.from("contact_submissions").update(writePayload).eq("id", existing.id)
      : await supabase.from("contact_submissions").insert(writePayload);

    if (error) {
      console.error("Client questionnaire draft save failed:", error);
      return NextResponse.json({ error: "Autosave failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, questionnaire, savedAt: new Date().toISOString() });
  }

  if (type === "brand") {
    const brand = questionnaire as BrandQuestionnairePayload;
    const businessName = trim(brand.identity?.businessName);
    const contactName = trim(brand.identity?.contactName);
    const email = trim(brand.identity?.email);
    const primaryGoal = trim(brand.goals?.primaryGoal);

    if (!businessName || !contactName || !email || !primaryGoal) {
      return NextResponse.json(
        { error: "Please complete the required fields (business name, contact name, email, and primary goal)" },
        { status: 400 }
      );
    }

    const message = JSON.stringify(
      {
        type: "brand_client_questionnaire",
        submittedBy: session.username,
        submittedAt: new Date().toISOString(),
        summary: summarizeBrandQuestionnaire(brand),
        questionnaire: brand,
      },
      null,
      2
    );

    const { error } = await supabase.from("contact_submissions").insert({
      name: contactName,
      company: businessName,
      email,
      phone: trim(brand.identity?.phone) || null,
      service: "Client Questionnaire",
      message,
      status: "new",
    });

    if (error) {
      console.error("Brand client questionnaire failed:", error);
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (type === "explanatory_animation") {
    const explainer = questionnaire as ExplanatoryAnimationQuestionnairePayload;
    const businessName = trim(explainer.identity?.businessName);
    const contactName = trim(explainer.identity?.contactName);
    const email = trim(explainer.identity?.email);
    const productFeatureName = trim(explainer.feature?.productFeatureName);
    const explanation = trim(explainer.feature?.explanation);
    const uniqueSellingPoint = trim(explainer.feature?.uniqueSellingPoint);
    const highlights = trim(explainer.message?.highlights);
    const mode = trim(explainer.video?.mode);
    const language = trim(explainer.video?.language);

    if (!businessName || !contactName || !email || !productFeatureName || !explanation || !uniqueSellingPoint || !highlights || !mode || !language) {
      return NextResponse.json({ error: "Please complete the required explainer fields" }, { status: 400 });
    }

    const message = JSON.stringify(
      {
        type: "explanatory_animation_questionnaire",
        submittedBy: session.username,
        submittedAt: new Date().toISOString(),
        summary: summarizeExplanatoryAnimationQuestionnaire(explainer),
        questionnaire: explainer,
      },
      null,
      2
    );

    const { error } = await supabase.from("contact_submissions").insert({
      name: contactName,
      company: businessName,
      email,
      phone: trim(explainer.identity?.phone) || null,
      service: "Client Questionnaire",
      message,
      status: "new",
    });

    if (error) {
      console.error("Explanatory animation questionnaire failed:", error);
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  if (type === "media_buying_clinic") {
    const clinic = questionnaire as MediaBuyingClinicQuestionnairePayload;
    const clinicName = trim(clinic.identity?.clinicName);
    const contactName = trim(clinic.identity?.contactName);
    const email = trim(clinic.identity?.email);
    const promoting = trim(clinic.monthPlan?.promoting);
    const unhappyAbout = trim(clinic.previousAds?.unhappyAbout);

    // v2 fields. Only enforced when the field is present in the submission, so
    // drafts saved before v2 can still be submitted without being blocked here.
    const isBlank = (value: unknown) => !trim(value);
    const v2Required: Array<[string, string]> = [
      ["the clinic name", clinicName],
      ["the contact name", contactName],
      ["the email address", email],
      ["what you are promoting this month", promoting],
    ];
    // A clinic that has never run ads is never asked what it was unhappy about,
    // so it must not be required from them.
    if (trim(clinic.previousAds?.hasRunAds) !== "No") {
      v2Required.push(["what you were unhappy about in previous advertising", unhappyAbout]);
    }
    if ("mohApproval" in (clinic.identity ?? {})) {
      v2Required.push(["whether Ministry of Health approval is needed", trim(clinic.identity?.mohApproval)]);
    }
    if ("adBudgetExact" in (clinic.monthPlan ?? {})) {
      const adBudget = trim(clinic.monthPlan?.adBudgetExact);
      if (!adBudget || Number.isNaN(Number(adBudget))) {
        v2Required.push(["your monthly ad budget paid to Meta (in KWD)", ""]);
      }
      v2Required.push(["how many bookings a month would make you happy", trim(clinic.monthPlan?.monthlyBookingTarget)]);
      v2Required.push(["the price of the service we're promoting", trim(clinic.monthPlan?.servicePrice)]);
    }
    if ("instagramLinks" in (clinic.competitors ?? {})) {
      const anyLink = (clinic.competitors?.instagramLinks ?? []).some((link) => !isBlank(link?.url));
      if (!anyLink) {
        v2Required.push(["at least one competitor clinic", ""]);
      }
    }
    if ("leadOwner" in (clinic.leadsAccess ?? {})) {
      v2Required.push(["who will answer the leads", trim(clinic.leadsAccess?.leadOwner)]);
      v2Required.push(["where leads arrive today", trim(clinic.leadsAccess?.leadChannel)]);
      v2Required.push(["the working hours for leads", trim(clinic.leadsAccess?.workingHours)]);
      const access = clinic.leadsAccess;
      if (!access?.accessAdAccount || !access?.accessPageIg || !access?.accessPixel || !access?.accessInbox) {
        v2Required.push(["all four items on the access checklist", ""]);
      }
    }

    const missing = v2Required.filter(([, value]) => !value).map(([label]) => label);

    if (missing.length) {
      return NextResponse.json(
        { error: `Please complete the required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const message = JSON.stringify(
      {
        type: "media_buying_clinic_questionnaire",
        submittedBy: session.username,
        submittedAt: new Date().toISOString(),
        summary: summarizeMediaBuyingClinicQuestionnaire(clinic),
        questionnaire: clinic,
      },
      null,
      2
    );

    const { error } = await supabase.from("contact_submissions").insert({
      name: contactName,
      company: clinicName,
      email,
      phone: trim(clinic.identity?.phone) || null,
      service: "Client Questionnaire",
      message,
      status: "new",
    });

    if (error) {
      console.error("Media buying clinic questionnaire failed:", error);
      return NextResponse.json({ error: "Submission failed" }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  }

  // Standard questionnaire
  const standard = questionnaire as QuestionnairePayload;
  const businessName = trim(standard.identity?.businessName);
  const contactName = trim(standard.identity?.contactName);
  const email = trim(standard.identity?.email);
  const primaryGoal = trim(standard.strategy?.primaryGoal);
  const visualWorld = trim(standard.taste?.world);

  if (!businessName || !contactName || !email || !primaryGoal || !visualWorld) {
    return NextResponse.json({ error: "Please complete the required fields" }, { status: 400 });
  }

  const message = JSON.stringify(
    {
      type: "client_questionnaire",
      submittedBy: session.username,
      submittedAt: new Date().toISOString(),
      summary: summarizeQuestionnaire(standard),
      questionnaire: standard,
    },
    null,
    2
  );

  const { error } = await supabase.from("contact_submissions").insert({
    name: contactName,
    company: businessName,
    email,
    phone: trim(standard.identity?.phone) || null,
    service: "Client Questionnaire",
    message,
    status: "new",
  });

  if (error) {
    console.error("Client questionnaire failed:", error);
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
