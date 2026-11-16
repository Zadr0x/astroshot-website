export type QuestionnaireSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
};

export type QuestionnairePayload = {
  identity: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    website: string;
    instagram: string;
    industry: string;
    location: string;
  };
  strategy: {
    primaryGoal: string;
    secondaryGoals: string[];
    audience: string;
    customerProblem: string;
    competitiveReason: string;
    bestSellers: string;
    currentChallenge: string;
  };
  taste: {
    world: string;
    room: string;
    energy: string;
    avoid: string;
    references: {
      nicheAccounts: string[];
      staticDesigns: string[];
      reels: string[];
    };
  };
  content: {
    formats: string[];
    faceComfort: string;
    shootingAccess: string;
    approvalStyle: string;
    offers: string;
    notes: string;
  };
  monthlyPlan: {
    month: string;
    products: MonthlyProductFocus[];
    calendarNotes: MonthlyCalendarNote[];
    notes: string;
  };
  assets: {
    brandFiles: UploadedBrandAsset[];
    driveLink: string;
    notes: string;
  };
};

export type MonthlyProductFocus = {
  name: string;
  type: string;
  priority: string;
  objective: string;
  details: string;
  offer: string;
  keyDate: string;
  assetNotes: string;
  files: UploadedBrandAsset[];
};

export type MonthlyCalendarNote = {
  date: string;
  note: string;
};

export type UploadedBrandAsset = {
  name: string;
  url: string;
  type: string;
  size: number;
};

export const questionnaireSections: QuestionnaireSection[] = [
  {
    id: "identity",
    eyebrow: "01 / Business DNA",
    title: "Who are we building attention for?",
    description: "The basics, but sharpened for strategy and content planning.",
  },
  {
    id: "strategy",
    eyebrow: "02 / Commercial Direction",
    title: "What should the content actually move?",
    description: "This tells us whether the account needs reach, trust, inquiries, conversion, or repositioning.",
  },
  {
    id: "taste",
    eyebrow: "03 / Visual Psychology",
    title: "What world should the brand feel like?",
    description: "These answers translate taste into visual direction, pacing, color, tone, and content references.",
  },
  {
    id: "content",
    eyebrow: "04 / Production Reality",
    title: "How bold can the content system be?",
    description: "This helps the team design ideas that are exciting, realistic, and easy to approve.",
  },
  {
    id: "assets",
    eyebrow: "05 / Brand & Assets",
    title: "What files should the creative team start from?",
    description: "Upload logos or brand guidelines, and share a Drive link for previous shoots, content, menus, products, or campaign material.",
  },
];

export const goalOptions = [
  "More inquiries",
  "More walk-ins",
  "Higher brand trust",
  "Launch a new product",
  "Look more premium",
  "Educate the market",
  "Recruit talent",
  "Beat competitors visually",
];

export const formatOptions = [
  "Trend-led content",
  "AI content",
  "UGC-style videos",
  "Founder/team content",
  "Offers and campaigns",
  "Behind the scenes",
];

export const monthlyProductTypes = ["Product", "Service", "Collection", "Offer", "Launch", "Event"];

export const monthlyPriorityOptions = ["Hero focus", "Support content", "Light mention"];

export const monthlyObjectiveOptions = [
  "Increase sales",
  "Launch awareness",
  "Drive store visits",
  "Educate customers",
  "Build brand trust",
  "Seasonal campaign",
];

export function emptyMonthlyProductFocus(): MonthlyProductFocus {
  return {
    name: "",
    type: "Product",
    priority: "Hero focus",
    objective: "",
    details: "",
    offer: "",
    keyDate: "",
    assetNotes: "",
    files: [],
  };
}

export function emptyQuestionnairePayload(): QuestionnairePayload {
  return {
    identity: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      instagram: "",
      industry: "",
      location: "",
    },
    strategy: {
      primaryGoal: "",
      secondaryGoals: [],
      audience: "",
      customerProblem: "",
      competitiveReason: "",
      bestSellers: "",
      currentChallenge: "",
    },
    taste: {
      world: "",
      room: "",
      energy: "",
      avoid: "",
      references: {
        nicheAccounts: ["", "", ""],
        staticDesigns: ["", "", ""],
        reels: ["", "", ""],
      },
    },
    content: {
      formats: [],
      faceComfort: "",
      shootingAccess: "",
      approvalStyle: "",
      offers: "",
      notes: "",
    },
    monthlyPlan: {
      month: "July 2026",
      products: [emptyMonthlyProductFocus()],
      calendarNotes: [],
      notes: "",
    },
    assets: {
      brandFiles: [],
      driveLink: "",
      notes: "",
    },
  };
}

export type QuestionnaireType = "standard" | "brand" | "explanatory_animation" | "media_buying_clinic";

export type ExplanatoryAnimationQuestionnairePayload = {
  identity: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
  };
  feature: {
    productFeatureName: string;
    explanation: string;
    uniqueSellingPoint: string;
    targetAudience: string;
    desiredAction: string;
  };
  message: {
    highlights: string;
    customerPain: string;
    proofPoints: string;
    mustInclude: string;
    mustAvoid: string;
  };
  video: {
    mode: "Light mode" | "Dark mode" | "";
    language: "Arabic" | "English" | "";
    tone: string;
    duration: string;
    references: string;
  };
  assets: {
    featureScreenshots: UploadedBrandAsset[];
    driveLink: string;
    notes: string;
  };
};

export const explanatoryAnimationQuestionnaireSections: QuestionnaireSection[] = [
  {
    id: "identity",
    eyebrow: "01 / Client",
    title: "Who is this explainer for?",
    description: "Basic client and contact details so the animation brief is tied to the right product team.",
  },
  {
    id: "feature",
    eyebrow: "02 / Product or Feature",
    title: "What are we explaining?",
    description: "The core feature, who it serves, and why people should care.",
  },
  {
    id: "message",
    eyebrow: "03 / Story Points",
    title: "What must the video make clear?",
    description: "The benefits, proof, highlights, and boundaries the script and storyboard must respect.",
  },
  {
    id: "video",
    eyebrow: "04 / Video Direction",
    title: "How should the explainer feel?",
    description: "Choose mode, language, tone, and useful references for the animation direction.",
  },
  {
    id: "assets",
    eyebrow: "05 / Screenshots & Assets",
    title: "What UI should appear in the video?",
    description: "Upload feature screenshots and share any supporting product assets the animation team should use.",
  },
];

export const explainerToneOptions = [
  "Clear and professional",
  "Friendly and simple",
  "Premium and polished",
  "Fast and energetic",
  "Technical but easy",
];

export const explainerDurationOptions = [
  "15-20 seconds",
  "30 seconds",
  "45 seconds",
  "60 seconds",
  "Not sure yet",
];

export function emptyExplanatoryAnimationQuestionnairePayload(): ExplanatoryAnimationQuestionnairePayload {
  return {
    identity: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
    },
    feature: {
      productFeatureName: "",
      explanation: "",
      uniqueSellingPoint: "",
      targetAudience: "",
      desiredAction: "",
    },
    message: {
      highlights: "",
      customerPain: "",
      proofPoints: "",
      mustInclude: "",
      mustAvoid: "",
    },
    video: {
      mode: "",
      language: "",
      tone: "",
      duration: "",
      references: "",
    },
    assets: {
      featureScreenshots: [],
      driveLink: "",
      notes: "",
    },
  };
}

export type BrandCaseStudy = {
  company: string;
  industry: string;
  problem: string;
  solution: string;
  timeframe: string;
  result: string;
  value: string;
};

export type BrandQuestionnairePayload = {
  identity: {
    businessName: string;
    contactName: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
    location: string;
    services: string;
    yearsOperating: string;
    teamSize: string;
  };
  competition: {
    competitors: string;
    competitorStrengths: string;
    competitorGaps: string;
    advantage: string;
    differentiators: string;
    whyChosen: string;
    marketPosition: string;
    weakness: string;
  };
  proof: {
    idealCustomer: string;
    customerProblem: string;
    problemCost: string;
    caseStudies: BrandCaseStudy[];
    totalRepairs: string;
    totalServiced: string;
    combinedExperience: string;
    largestJob: string;
    fastestTurnaround: string;
    repeatRate: string;
    testimonials: string;
    beforeAfter: string;
  };
  goals: {
    primaryGoal: string;
    secondaryGoals: string[];
    keyMessage: string;
    credibility: string;
    quantityOrQuality: string;
    audienceSplit: string;
    tone: string;
    language: string;
    avoid: string;
    currentContent: string;
    offers: string;
  };
  visual: {
    feeling: string;
    admiredAccounts: string;
    competitorAccounts: string;
    style: string;
    faces: string;
    onCamera: string;
  };
  production: {
    workshopAccess: string;
    liveRepair: string;
    lighting: string;
    restricted: string;
    ppe: string;
    notice: string;
    onsiteContact: string;
  };
  assets: {
    brandFiles: UploadedBrandAsset[];
    driveLink: string;
    approvalWorkflow: string;
    turnaround: string;
    cadence: string;
    primaryContact: string;
    notes: string;
  };
};

export const brandQuestionnaireSections: QuestionnaireSection[] = [
  {
    id: "identity",
    eyebrow: "01 / Business DNA",
    title: "Who are we building authority for?",
    description: "The fundamentals, sharpened for a brand repositioning and authority build.",
  },
  {
    id: "competition",
    eyebrow: "02 / Market & Competition",
    title: "Who are we up against?",
    description: "Where competitors win, where they fall short, and where you take the lead.",
  },
  {
    id: "proof",
    eyebrow: "03 / Customers & Proof",
    title: "What proves we're the best?",
    description: "Case studies, real numbers, and the evidence that builds trust and wins contracts.",
  },
  {
    id: "goals",
    eyebrow: "04 / Goals & Messaging",
    title: "What should content actually move?",
    description: "The message, tone, and outcomes that guide every post and campaign.",
  },
  {
    id: "visual",
    eyebrow: "05 / Visual & Tone",
    title: "What world should the brand feel like?",
    description: "Translate ambition into visual direction, style, and references.",
  },
  {
    id: "production",
    eyebrow: "06 / Production Reality",
    title: "Can we actually film this?",
    description: "Access, safety, and logistics so shoots run smooth and safe.",
  },
  {
    id: "assets",
    eyebrow: "07 / Assets & Logistics",
    title: "Files, approvals, and cadence",
    description: "Everything the creative team needs to start, and how work gets approved.",
  },
];

export const brandPrimaryGoalOptions = [
  "Build authority & trust",
  "Generate B2B leads",
  "Win bigger contracts",
  "Recruit skilled talent",
  "Educate the market",
];

export const brandToneOptions = [
  "Authoritative",
  "Premium",
  "Technical",
  "Approachable",
  "Bold",
];

export const brandLanguageOptions = ["English", "Arabic", "Bilingual"];

export const brandStyleOptions = [
  "Clean / Corporate",
  "Cinematic / Industrial",
  "Tech / Blueprint",
  "Premium dark",
];

export function emptyBrandCaseStudy(): BrandCaseStudy {
  return {
    company: "",
    industry: "",
    problem: "",
    solution: "",
    timeframe: "",
    result: "",
    value: "",
  };
}

export function emptyBrandQuestionnairePayload(): BrandQuestionnairePayload {
  return {
    identity: {
      businessName: "",
      contactName: "",
      email: "",
      phone: "",
      website: "",
      industry: "",
      location: "",
      services: "",
      yearsOperating: "",
      teamSize: "",
    },
    competition: {
      competitors: "",
      competitorStrengths: "",
      competitorGaps: "",
      advantage: "",
      differentiators: "",
      whyChosen: "",
      marketPosition: "",
      weakness: "",
    },
    proof: {
      idealCustomer: "",
      customerProblem: "",
      problemCost: "",
      caseStudies: [emptyBrandCaseStudy()],
      totalRepairs: "",
      totalServiced: "",
      combinedExperience: "",
      largestJob: "",
      fastestTurnaround: "",
      repeatRate: "",
      testimonials: "",
      beforeAfter: "",
    },
    goals: {
      primaryGoal: "",
      secondaryGoals: [],
      keyMessage: "",
      credibility: "",
      quantityOrQuality: "",
      audienceSplit: "",
      tone: "",
      language: "",
      avoid: "",
      currentContent: "",
      offers: "",
    },
    visual: {
      feeling: "",
      admiredAccounts: "",
      competitorAccounts: "",
      style: "",
      faces: "",
      onCamera: "",
    },
    production: {
      workshopAccess: "",
      liveRepair: "",
      lighting: "",
      restricted: "",
      ppe: "",
      notice: "",
      onsiteContact: "",
    },
    assets: {
      brandFiles: [],
      driveLink: "",
      approvalWorkflow: "",
      turnaround: "",
      cadence: "",
      primaryContact: "",
      notes: "",
    },
  };
}

export function summarizeBrandQuestionnaire(payload: BrandQuestionnairePayload) {
  const caseStudies = (payload.proof.caseStudies ?? [])
    .filter((item) => item.company.trim() || item.problem.trim())
    .map(
      (item) =>
        `${item.company.trim() || "(unnamed)"} / ${item.industry.trim() || "n/a"}: ${item.problem.trim() || ""} -> ${item.solution.trim() || ""} (${item.result.trim() || "no result given"})`
    )
    .join("\n    - ");

  return [
    `Business: ${payload.identity.businessName}`,
    `Contact: ${payload.identity.contactName} / ${payload.identity.email}`,
    `Services: ${payload.identity.services}`,
    `Years operating: ${payload.identity.yearsOperating}`,
    `Team size: ${payload.identity.teamSize}`,
    `Competitors: ${payload.competition.competitors}`,
    `Competitive advantage: ${payload.competition.advantage}`,
    `Primary goal: ${payload.goals.primaryGoal}`,
    `Secondary goals: ${payload.goals.secondaryGoals.join(", ") || "None selected"}`,
    `Key message: ${payload.goals.keyMessage}`,
    `Tone: ${payload.goals.tone} / Language: ${payload.goals.language}`,
    `Case studies (${(payload.proof.caseStudies ?? []).filter((i) => i.company.trim() || i.problem.trim()).length}):`,
    `    - ${caseStudies || "None provided"}`,
    `Total repairs: ${payload.proof.totalRepairs}`,
    `Total serviced: ${payload.proof.totalServiced}`,
    `Combined experience: ${payload.proof.combinedExperience}`,
    `Visual style: ${payload.visual.style}`,
    `Cadence: ${payload.assets.cadence}`,
    `Brand files: ${payload.assets.brandFiles.length}`,
    `Asset Drive: ${payload.assets.driveLink || "Not provided"}`,
  ].join("\n");
}

export function summarizeExplanatoryAnimationQuestionnaire(payload: ExplanatoryAnimationQuestionnairePayload) {
  return [
    `Business: ${payload.identity.businessName}`,
    `Contact: ${payload.identity.contactName} / ${payload.identity.email}`,
    `Product / feature: ${payload.feature.productFeatureName}`,
    `Explanation: ${payload.feature.explanation}`,
    `Unique selling point: ${payload.feature.uniqueSellingPoint}`,
    `Target audience: ${payload.feature.targetAudience}`,
    `Desired action: ${payload.feature.desiredAction}`,
    `Highlights: ${payload.message.highlights}`,
    `Customer pain: ${payload.message.customerPain}`,
    `Proof points: ${payload.message.proofPoints}`,
    `Must include: ${payload.message.mustInclude}`,
    `Must avoid: ${payload.message.mustAvoid}`,
    `Mode: ${payload.video.mode || "Not selected"}`,
    `Language: ${payload.video.language || "Not selected"}`,
    `Tone: ${payload.video.tone || "Not selected"}`,
    `Duration: ${payload.video.duration || "Not selected"}`,
    `References: ${payload.video.references || "Not provided"}`,
    `Screenshots uploaded: ${payload.assets.featureScreenshots.length}`,
    `Asset Drive: ${payload.assets.driveLink || "Not provided"}`,
  ].join("\n");
}

export function summarizeQuestionnaire(payload: QuestionnairePayload) {
  const monthlyItems = payload.monthlyPlan?.products
    ?.map((item) => item.name.trim())
    .filter(Boolean)
    .join(", ");

  return [
    `Business: ${payload.identity.businessName}`,
    `Contact: ${payload.identity.contactName} / ${payload.identity.email}`,
    `Primary goal: ${payload.strategy.primaryGoal}`,
    `Secondary goals: ${payload.strategy.secondaryGoals.join(", ") || "None selected"}`,
    `Why choose you over competitors: ${payload.strategy.competitiveReason || "Not provided"}`,
    `Visual world: ${payload.taste.world}`,
    `Visual style: ${payload.taste.room}`,
    `Energy: ${payload.taste.energy}`,
    `Formats: ${payload.content.formats.join(", ") || "None selected"}`,
    `Approval style: ${payload.content.approvalStyle}`,
    `Monthly plan: ${payload.monthlyPlan?.month || "Not provided"}`,
    `Monthly products/services: ${monthlyItems || "None provided"}`,
    `Brand files: ${payload.assets.brandFiles.length}`,
    `Asset Drive: ${payload.assets.driveLink || "Not provided"}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Media Buying Clinics questionnaire — content + paid media for clinics.
// Platform-agnostic by design (Meta is the current default, not a constraint).
// ---------------------------------------------------------------------------

export type MediaBuyingDoctor = {
  name: string;
  specialty: string;
  services: string;
  uniqueAdvantage: string;
  proof: string;
  restrictedClaims: string;
};

export type MediaBuyingPreviousAdLink = {
  url: string;
  note: string;
};

export type MediaBuyingCompetitorLink = {
  url: string;
};

export type MediaBuyingClinicQuestionnairePayload = {
  identity: {
    clinicName: string;
    instagram: string;
    website: string;
    contactName: string;
    email: string;
    phone: string;
    location: string;
    specialties: string;
    mohApproval: string;
    mohOwner: string;
  };
  previousAds: {
    hasRunAds: string;
    channels: string;
    otherChannels: string;
    timeframe: string;
    duration: string;
    goal: string;
    results: string;
    unhappyAbout: string;
    /** Ad spend figure in KWD (v2). Older drafts may still hold a band label. */
    spendBand: string;
    reports: UploadedBrandAsset[];
    adLinks: MediaBuyingPreviousAdLink[];
    creativeObservations: string;
  };
  monthPlan: {
    promoting: string;
    primaryGoal: string;
    audienceAge: string;
    audienceGender: string;
    audienceArea: string;
    audienceNotes: string;
    /** Replaced by adBudgetExact in v2 — kept optional so old drafts still type-check. */
    budgetBand?: string;
    adBudgetExact: string;
    monthlyBookingTarget: string;
    servicePrice: string;
    keyDates: string;
  };
  competitors: {
    instagramLinks: MediaBuyingCompetitorLink[];
    theirStrengths: string;
    ourStrengths: string;
  };
  leadsAccess: {
    leadOwner: string;
    leadChannel: string;
    workingHours: string;
    accessAdAccount: boolean;
    accessPageIg: boolean;
    accessPixel: boolean;
    accessInbox: boolean;
  };
  monthlyExtras: {
    monthlyMaterial: string;
    monthlyNotes: string;
    monthlyFiles: UploadedBrandAsset[];
  };
  doctors: MediaBuyingDoctor[];
  assets: {
    brandAssetsAvailable: string;
    brandFiles: UploadedBrandAsset[];
    existingMaterial: string;
    approver: string;
    approvalSpeed: string;
    driveLink: string;
    /** Removed from the setup form in v2 (moved to monthlyExtras.monthlyNotes); kept for old drafts. */
    notes: string;
  };
};

export const mediaBuyingClinicQuestionnaireSections: QuestionnaireSection[] = [
  {
    id: "identity",
    eyebrow: "01 / The Clinic",
    title: "Who are we running ads for?",
    description: "The clinic, its channels, and the people we will be dealing with week to week.",
  },
  {
    id: "previousAds",
    eyebrow: "02 / Previous Advertising",
    title: "What happened last time?",
    description:
      "This is the most important part of the form. If we do not understand what went wrong before, we will repeat it. The more honest this section is, the better the campaign.",
  },
  {
    id: "assets",
    eyebrow: "03 / Assets & Approvals",
    title: "What do we have, and who signs off?",
    description: "Brand files, existing footage, and the approval loop that keeps campaigns moving.",
  },
  {
    id: "competitors",
    eyebrow: "04 / Competitors",
    title: "Who are you up against?",
    description: "The clinics you are compared to, and what each side does better. This shapes the angle we take.",
  },
  {
    id: "leadsAccess",
    eyebrow: "05 / Leads & Access",
    title: "Who answers the phone, and what can we reach?",
    description: "Where the leads land, how fast they get answered, and the access we need before we can run anything.",
  },
];

export const mediaBuyingClinicMonthlySections: QuestionnaireSection[] = [
  {
    id: "monthPlan",
    eyebrow: "01 / This Month",
    title: "What are we promoting now?",
    description: "The focus, the goal, the audience, and the ad budget for this month.",
  },
  {
    id: "doctors",
    eyebrow: "02 / Doctors",
    title: "Who are we putting in front of the camera?",
    description:
      "Add every doctor we should focus on this month — as many as you need. Each doctor gets their own creative angle.",
  },
  {
    id: "monthlyExtras",
    eyebrow: "03 / This Month's Extras",
    title: "Anything new this month?",
    description: "New material, sensitivities for the month, and any files the creative team should work from.",
  },
];

export const mediaBuyingSpendBandOptions = [
  "Under 500 KWD per month",
  "500 – 1500 KWD per month",
  "1500 – 3000 KWD per month",
  "3000+ KWD per month",
  "Prefer not to say",
];

export const mediaBuyingBudgetBandOptions = [
  "Under 500 KWD",
  "500 – 1500 KWD",
  "1500 – 3000 KWD",
  "3000+ KWD",
  "Prefer not to say",
];

export const mediaBuyingHasRunAdsOptions = ["Yes", "No", "Not sure"];

export const mediaBuyingMohApprovalOptions = ["Yes", "No", "Not sure"];

export const mediaBuyingLeadChannelOptions = [
  "WhatsApp Business app",
  "WhatsApp API",
  "Phone",
  "CRM",
  "Other",
];

export const mediaBuyingPreviousGoalOptions = [
  "Awareness",
  "Leads",
  "Bookings",
  "Messages / DMs",
  "Walk-ins",
  "Followers / engagement",
];

export const mediaBuyingPrimaryGoalOptions = [
  "Bookings / appointments",
  "Leads",
  "Direct messages (DMs)",
  "Brand awareness",
  "A specific service",
  "Walk-ins",
];

export const mediaBuyingChannelOptions = [
  "Instagram / Meta (Facebook & Instagram)",
  "TikTok",
  "Snapchat",
  "Google Search / YouTube",
  "X (Twitter)",
  "Not sure",
];

export const mediaBuyingComplianceNotice =
  "Medical advertising has restrictions. We cannot promise guaranteed results, and before/after images can only be used where permitted. All claims must be truthful and non-misleading. Use the field below to flag what is allowed and what is off-limits for each doctor — if you are unsure, tell us and we will check before we run anything.";

export function emptyMediaBuyingDoctor(): MediaBuyingDoctor {
  return {
    name: "",
    specialty: "",
    services: "",
    uniqueAdvantage: "",
    proof: "",
    restrictedClaims: "",
  };
}

export function emptyMediaBuyingPreviousAdLink(): MediaBuyingPreviousAdLink {
  return {
    url: "",
    note: "",
  };
}

export function emptyCompetitorLink(): MediaBuyingCompetitorLink {
  return { url: "" };
}

export function emptyMediaBuyingClinicQuestionnairePayload(): MediaBuyingClinicQuestionnairePayload {
  return {
    identity: {
      clinicName: "",
      instagram: "",
      website: "",
      contactName: "",
      email: "",
      phone: "",
      location: "",
      specialties: "",
      mohApproval: "",
      mohOwner: "",
    },
    previousAds: {
      hasRunAds: "",
      channels: "",
      otherChannels: "",
      timeframe: "",
      duration: "",
      goal: "",
      results: "",
      unhappyAbout: "",
      spendBand: "",
      reports: [],
      adLinks: [emptyMediaBuyingPreviousAdLink()],
      creativeObservations: "",
    },
    monthPlan: {
      promoting: "",
      primaryGoal: "",
      audienceAge: "",
      audienceGender: "",
      audienceArea: "",
      audienceNotes: "",
      adBudgetExact: "",
      monthlyBookingTarget: "",
      servicePrice: "",
      keyDates: "",
    },
    competitors: {
      instagramLinks: [emptyCompetitorLink()],
      theirStrengths: "",
      ourStrengths: "",
    },
    leadsAccess: {
      leadOwner: "",
      leadChannel: "",
      workingHours: "",
      accessAdAccount: false,
      accessPageIg: false,
      accessPixel: false,
      accessInbox: false,
    },
    monthlyExtras: {
      monthlyMaterial: "",
      monthlyNotes: "",
      monthlyFiles: [],
    },
    doctors: [emptyMediaBuyingDoctor()],
    assets: {
      brandAssetsAvailable: "",
      brandFiles: [],
      existingMaterial: "",
      approver: "",
      approvalSpeed: "",
      driveLink: "",
      notes: "",
    },
  };
}

export function summarizeMediaBuyingClinicQuestionnaire(payload: MediaBuyingClinicQuestionnairePayload) {
  const doctors = (payload.doctors ?? [])
    .filter((doctor) => doctor.name.trim() || doctor.specialty.trim())
    .map(
      (doctor, index) =>
        `    ${index + 1}. ${doctor.name.trim() || "(unnamed)"} — ${doctor.specialty.trim() || "specialty not given"} | advertising: ${
          doctor.services.trim() || "n/a"
        } | advantage: ${doctor.uniqueAdvantage.trim() || "n/a"} | restricted: ${doctor.restrictedClaims.trim() || "none flagged"}`
    )
    .join("\n");

  const adLinks = (payload.previousAds?.adLinks ?? [])
    .filter((link) => link.url.trim())
    .map((link, index) => `    ${index + 1}. ${link.url.trim()}${link.note.trim() ? ` (${link.note.trim()})` : ""}`)
    .join("\n");

  const mohApproval = payload.identity?.mohApproval ?? "";
  const mohOwner = payload.identity?.mohOwner ?? "";

  const competitors = (payload.competitors?.instagramLinks ?? [])
    .filter((link) => link.url.trim())
    .map((link, index) => `    ${index + 1}. ${link.url.trim()}`)
    .join("\n");

  const accessFlags: Array<[string, boolean]> = [
    ["Meta ad account", Boolean(payload.leadsAccess?.accessAdAccount)],
    ["Facebook Page / Instagram", Boolean(payload.leadsAccess?.accessPageIg)],
    ["Pixel", Boolean(payload.leadsAccess?.accessPixel)],
    ["WhatsApp / inbox", Boolean(payload.leadsAccess?.accessInbox)],
  ];
  const accessLines = accessFlags
    .map(([label, given]) => `    ${label}: ${given ? "yes" : "no"}${given ? "" : " ⚠ missing"}`)
    .join("\n");

  return [
    `Clinic: ${payload.identity?.clinicName ?? ""}`,
    `Instagram: ${payload.identity?.instagram || "Not provided"}`,
    `Website: ${payload.identity?.website || "Not provided"}`,
    `Contact: ${payload.identity?.contactName ?? ""} / ${payload.identity?.email ?? ""} / ${payload.identity?.phone || "no phone"}`,
    `Location / branches: ${payload.identity?.location ?? ""}`,
    `Specialties covered: ${payload.identity?.specialties ?? ""}`,
    `MoH approval: ${mohApproval}${mohOwner ? ` — handled by ${mohOwner}` : ""}`,
    `--- Previous advertising ---`,
    `Has run paid ads: ${payload.previousAds?.hasRunAds || "Not answered"}`,
    `Channels used: ${payload.previousAds?.channels || "Not provided"}`,
    `Other channels: ${payload.previousAds?.otherChannels || "None"}`,
    `When / how long: ${payload.previousAds?.timeframe || "n/a"} / ${payload.previousAds?.duration || "n/a"}`,
    `Previous goal: ${payload.previousAds?.goal || "Not provided"}`,
    `Results in their words: ${payload.previousAds?.results || "Not provided"}`,
    `UNHAPPY ABOUT: ${payload.previousAds?.unhappyAbout || "Not provided"}`,
    `Previous monthly spend (KWD): ${payload.previousAds?.spendBand || "Not provided"}`,
    `Previous reports uploaded: ${(payload.previousAds?.reports ?? []).length}`,
    `Previous ad links (${(payload.previousAds?.adLinks ?? []).filter((l) => l.url.trim()).length}):\n${adLinks || "    None provided"}`,
    `Creative observations: ${payload.previousAds?.creativeObservations || "Not provided"}`,
    `--- Competitors ---`,
    `Competitor clinics (${(payload.competitors?.instagramLinks ?? []).filter((l) => l.url.trim()).length}):\n${
      competitors || "    None provided"
    }`,
    `Their strengths: ${payload.competitors?.theirStrengths || "Not provided"}`,
    `Our strengths: ${payload.competitors?.ourStrengths || "Not provided"}`,
    `--- Leads & access ---`,
    `Lead owner: ${payload.leadsAccess?.leadOwner || "Not provided"}`,
    `Lead channel: ${payload.leadsAccess?.leadChannel || "Not provided"}`,
    `Working hours: ${payload.leadsAccess?.workingHours || "Not provided"}`,
    `Access checklist:\n${accessLines}`,
    `--- This month ---`,
    `Promoting: ${payload.monthPlan?.promoting ?? ""}`,
    `Primary goal: ${payload.monthPlan?.primaryGoal || "Not provided"}`,
    `Monthly booking target: ${payload.monthPlan?.monthlyBookingTarget || "Not provided"}`,
    `Service price: ${payload.monthPlan?.servicePrice || "Not provided"} KWD`,
    `Monthly ad budget (Meta only, excl. fee): ${payload.monthPlan?.adBudgetExact || "Not provided"} KWD`,
    `Audience: age ${payload.monthPlan?.audienceAge || "n/a"}, gender ${payload.monthPlan?.audienceGender || "n/a"}, area ${payload.monthPlan?.audienceArea || "n/a"}`,
    `Audience notes: ${payload.monthPlan?.audienceNotes || "None"}`,
    `Key dates: ${payload.monthPlan?.keyDates || "None"}`,
    `--- Doctors (${(payload.doctors ?? []).filter((d) => d.name.trim() || d.specialty.trim()).length}) ---\n${doctors || "    None provided"}`,
    `--- Assets ---`,
    `Brand assets available: ${payload.assets?.brandAssetsAvailable || "Not provided"}`,
    `Brand files uploaded: ${(payload.assets?.brandFiles ?? []).length}`,
    `Existing material: ${payload.assets?.existingMaterial || "Not provided"}`,
    `Creative approver: ${payload.assets?.approver || "Not provided"}`,
    `Approval speed: ${payload.assets?.approvalSpeed || "Not provided"}`,
    `Asset Drive: ${payload.assets?.driveLink || "Not provided"}`,
    `Notes: ${payload.assets?.notes || "None"}`,
    `--- This month's extras ---`,
    `New material: ${payload.monthlyExtras?.monthlyMaterial || "None"}`,
    `Monthly notes: ${payload.monthlyExtras?.monthlyNotes || "None"}`,
    `Monthly files uploaded: ${(payload.monthlyExtras?.monthlyFiles ?? []).length}`,
  ].join("\n");
}
