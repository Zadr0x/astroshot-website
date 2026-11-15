import corpus from "@/data/kuwaiti-caption-corpus.json";

type CaptionRecord = {
  ownerUsername: string;
  caption: string;
  likesCount?: number;
  commentsCount?: number;
  url?: string;
};

const records = corpus as CaptionRecord[];

const STYLE_GUIDE = [
  "Use natural Kuwaiti dialect first: شنو، وايد، خل، الحين، وياكم، حياكم، ناطرينكم, without forcing every word.",
  "Start with a hook, question, mood, local moment, or direct benefit. Avoid stiff Modern Standard Arabic unless the finance/reference style needs it.",
  "Keep the caption social and ready for Instagram: short lines, clear CTA, useful details, and no fake offers or invented claims.",
  "For F&B, connect the product to يمعة، قعدة، ريوق، سحور، ديوانية، الويكند، or craving moments.",
  "For premium/lifestyle brands, keep it warmer and cleaner: fewer emojis, more sensory detail, less shouting.",
  "For finance, use clear professional Arabic with light Kuwaiti phrasing; never invent investment claims, numbers, guarantees, or regulatory promises.",
  "Use emoji only if the brand tone allows it. One to three emojis is enough.",
  "Do not copy the examples verbatim. Use them only to learn rhythm, dialect, and structure.",
].join("\n");

const ACCOUNT_LABELS: Record<string, string> = {
  just_burgers_kwt: "Burger/F&B: youthy, direct craving, English-mixed Kuwaiti",
  just_manoushe: "Sandwich/F&B: warm Kuwaiti, community, family, branch/opening/service clarity",
  "cro.kwt": "Bakery/cafe: warm, polished, sensory, place/time details",
  joinzad: "Finance: clear, professional, trusted, light Kuwaiti touches",
  b7ry: "Influencer/storytelling: hook-led, curiosity, direct local language",
};

const STYLE_ACCOUNTS: Record<string, string[]> = {
  auto: [],
  fnb: ["just_burgers_kwt", "just_manoushe"],
  bakery: ["cro.kwt", "just_manoushe"],
  finance: ["joinzad"],
  influencer: ["b7ry"],
  mixed: ["just_burgers_kwt", "just_manoushe", "cro.kwt", "joinzad", "b7ry"],
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function clampCaption(value: string) {
  const cleaned = clean(value);
  return cleaned.length > 420 ? `${cleaned.slice(0, 417)}...` : cleaned;
}

function engagementScore(record: CaptionRecord) {
  return (record.likesCount ?? 0) + (record.commentsCount ?? 0) * 4;
}

function inferAccounts(searchText: string) {
  const value = searchText.toLowerCase();
  const accounts = new Set<string>();

  if (/(finance|financial|invest|trading|stock|bank|zad|تداول|استثمار|اسهم|أسهم|مالي|بنك)/i.test(value)) {
    accounts.add("joinzad");
  }

  if (/(bakery|bake|croissant|cake|dessert|coffee|cafe|pastry|كيك|كرواسون|قهوة|حلويات|مخبز|كافيه)/i.test(value)) {
    accounts.add("cro.kwt");
  }

  if (/(burger|sandwich|food|restaurant|manoushe|f&b|dining|برجر|ساندويتش|مطعم|اكل|أكل|منقوشة|ريوق|سحور|فطور)/i.test(value)) {
    accounts.add("just_burgers_kwt");
    accounts.add("just_manoushe");
  }

  if (/(influencer|creator|personal|story|vlog|مؤثر|مشهور|قصة|فلوق|سناب)/i.test(value)) {
    accounts.add("b7ry");
  }

  return accounts.size > 0 ? Array.from(accounts) : STYLE_ACCOUNTS.mixed;
}

function pickExamples(accounts: string[], perAccount: number) {
  return accounts.flatMap((account) => {
    return records
      .filter((record) => record.ownerUsername === account && clean(record.caption).length > 0)
      .sort((a, b) => engagementScore(b) - engagementScore(a))
      .slice(0, perAccount)
      .map((record) => ({
        account,
        caption: clampCaption(record.caption),
      }));
  });
}

export function buildKuwaitiCaptionCorpusContext(input: {
  referenceStyle?: string;
  brandName?: string;
  tone?: string;
  products?: string;
  audience?: string;
  captionRules?: string;
  approvedExamples?: string;
}) {
  const referenceStyle = input.referenceStyle || "auto";
  const explicitAccounts = STYLE_ACCOUNTS[referenceStyle] ?? [];
  const accounts = explicitAccounts.length > 0
    ? explicitAccounts
    : inferAccounts([input.brandName, input.tone, input.products, input.audience, input.captionRules].filter(Boolean).join(" "));

  const examples = pickExamples(accounts, accounts.length > 2 ? 2 : 3);
  const approvedExamples = clean(input.approvedExamples ?? "");

  return [
    "KUWAITI CAPTION CORPUS",
    "Built from 150 Instagram captions across Just Burgers, Just Manoushe, CRO, JoinZad, and B7ry.",
    "",
    "Style guide:",
    STYLE_GUIDE,
    "",
    "Reference accounts for this request:",
    accounts.map((account) => `- ${account}: ${ACCOUNT_LABELS[account] ?? "Kuwaiti reference account"}`).join("\n"),
    "",
    "Selected examples to learn from, not copy:",
    examples.map((example, index) => `${index + 1}. [${example.account}] ${example.caption}`).join("\n"),
    approvedExamples ? `\nAstroshot-approved examples for this specific client:\n${approvedExamples}` : "",
  ].filter(Boolean).join("\n");
}
