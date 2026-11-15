export type CaseStudyFact = {
  label: string;
  value: string;
};

export type CaseStudySection = {
  title: string;
  body: string;
};

export type CaseStudyProofLink = {
  label: string;
  href: string;
};

export type CaseStudyData = {
  client: string;
  industry: string;
  location: string;
  campaignType: string;
  services: string[];
  result: string;
  facts: CaseStudyFact[];
  sections: CaseStudySection[];
  proofLinks: CaseStudyProofLink[];
  keywords: string[];
};

type ProjectCaseStudyInput = {
  id: string;
  title: string;
  category: string;
  description: string | null;
};

function clientFromProjectTitle(title: string) {
  return title.split(" - ")[0]?.trim() || title.trim();
}

function compactText(value: string | null | undefined) {
  return (value ?? "").replace(/\s+/g, " ").trim();
}

function firstSentence(value: string | null | undefined) {
  const text = compactText(value);
  if (!text) return "";
  const match = text.match(/^(.+?[.!?])(\s|$)/);
  return (match?.[1] ?? text).trim();
}

function industryForProject(title: string, category: string) {
  const normalized = title.toLowerCase();

  if (normalized.includes("bank") || normalized.includes("kib") || normalized.includes("nbk") || normalized.includes("warba")) {
    return "Banking and finance";
  }

  if (
    normalized.includes("mercedes") ||
    normalized.includes("bmw") ||
    normalized.includes("ford") ||
    normalized.includes("chevrolet") ||
    normalized.includes("mg") ||
    normalized.includes("hongqi") ||
    normalized.includes("honda")
  ) {
    return "Automotive";
  }

  if (normalized.includes("mall") || normalized.includes("trolley") || normalized.includes("brandaat")) {
    return "Retail and destination marketing";
  }

  if (normalized.includes("national geographic")) return "Entertainment and attractions";
  if (normalized.includes("construction") || normalized.includes("homes")) return "Real estate and construction";
  if (normalized.includes("burger") || normalized.includes("cookies") || normalized.includes("nuts")) return "Food and beverage";
  if (normalized.includes("perfume") || normalized.includes("qurashi")) return "Fragrance and lifestyle";
  if (normalized.includes("dawi")) return "Health and technology";

  if (category === "Social Media Content" || category === "Social Media") return "Social media and brand content";
  if (category === "Motion Graphics") return "Product communication";
  return "Brand campaign";
}

function servicesForCategory(category: string, title: string) {
  const normalized = `${category} ${title}`.toLowerCase();
  const services = new Set<string>();

  if (normalized.includes("social")) {
    services.add("Social media content");
    services.add("Content creation");
    services.add("Platform-ready editing");
  }

  if (normalized.includes("motion")) {
    services.add("Motion graphics");
    services.add("Storyboard development");
    services.add("Animation");
  }

  if (normalized.includes("cgi") || normalized.includes("mixed reality") || normalized.includes("vfx")) {
    services.add("Creative concept development");
    services.add("Mixed reality production");
    services.add("CGI");
    services.add("VFX compositing");
    services.add("Social-first launch content");
  }

  if (normalized.includes("cinema ai") || normalized.includes("ai")) {
    services.add("AI-powered visual production");
    services.add("Cinematic campaign direction");
    services.add("Social media content");
  }

  if (services.size === 0) {
    services.add("Creative concept development");
    services.add("Campaign content");
    services.add("Social media production");
  }

  return Array.from(services);
}

function buildFallbackCaseStudyData(project: ProjectCaseStudyInput): CaseStudyData {
  const client = clientFromProjectTitle(project.title);
  const industry = industryForProject(project.title, project.category);
  const services = servicesForCategory(project.category, project.title);
  const summary =
    firstSentence(project.description) ||
    `${project.title} by Astroshot, built as social-first campaign content for brand visibility.`;

  return {
    client,
    industry,
    location: "Kuwait and GCC",
    campaignType: `${project.category} campaign content`,
    services,
    result: summary,
    facts: [
      { label: "Client", value: client },
      { label: "Category", value: project.category },
      { label: "Market", value: "Kuwait and GCC" },
      { label: "Format", value: "Social-first campaign asset" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "The brand needed campaign content that could create attention quickly and communicate the idea in a format built for digital and social platforms.",
      },
      {
        title: "Idea",
        body:
          summary,
      },
      {
        title: "Execution",
        body:
          compactText(project.description) ||
          "Astroshot developed the creative direction, produced the campaign asset, and shaped the final output for social media visibility.",
      },
      {
        title: "Result",
        body:
          "The project gave the brand a stronger visual campaign asset designed to stand out, support awareness, and make the communication easier to notice and share.",
      },
    ],
    proofLinks: [
      { label: "Creative Agency Kuwait", href: "/creative-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      project.title,
      `${client} campaign`,
      `${project.category} Kuwait`,
      "Astroshot case study",
      "creative campaign Kuwait",
    ],
  };
}

export const caseStudyDataByProjectId: Record<string, CaseStudyData> = {
  "2ce2ae0e-5ce2-4bd6-97a5-be1ba9625f25": {
    client: "Huawei",
    industry: "Consumer electronics and technology",
    location: "Kuwait",
    campaignType: "FreeClip 2 launch with mixed reality social activation",
    services: [
      "Creative concept development",
      "Mixed reality production",
      "CGI",
      "VFX compositing",
      "Launch video production",
      "Social media content",
    ],
    result:
      "A mixed reality launch video where the Huawei FreeClip 2 descends from a mall ceiling, generating 2.5M+ views and pushing the product past its sales target in one week.",
    facts: [
      { label: "Views", value: "2.5M+ views" },
      { label: "Timeline", value: "Delivered in 1 week" },
      { label: "Deliverable", value: "Mixed reality launch video" },
      { label: "Market", value: "Kuwait" },
      { label: "Client", value: "Huawei (1st collaboration)" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Huawei wanted shareable, viral-style content for the FreeClip 2 launch that also mirrored the physical booth they planned to build — so that seeing the booth would instantly trigger memory of the video. The entire production had to be delivered in one week.",
      },
      {
        title: "Idea",
        body:
          "Use a mixed reality video that exaggerates the booth concept: the FreeClip 2 rises down from a mall ceiling in a booth while the sound ripples through the surrounding environment — built to stop the scroll on social media.",
      },
      {
        title: "Execution",
        body:
          "Astroshot produced the mixed reality launch video in one week, blending CGI, VFX compositing, and social-first pacing. Huawei later reused the same concept for the real-life booth, creating a direct link between the content and the physical activation.",
      },
      {
        title: "Result",
        body:
          "The video generated 2.5M+ views, the FreeClip 2 exceeded its sales target, and the campaign became the starting point of an ongoing relationship with Huawei across multiple launches.",
      },
    ],
    proofLinks: [
      { label: "Mixed Reality Agency Kuwait", href: "/creative-agency-kuwait" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Huawei FreeClip 2 Kuwait",
      "Huawei Kuwait launch campaign",
      "mixed reality video Kuwait",
      "product launch video Kuwait",
      "viral social media campaign Kuwait",
    ],
  },
  "a22e68e6-d4bd-4c65-bc02-64ea5875a0f3": {
    client: "Huawei",
    industry: "Consumer electronics and technology",
    location: "Kuwait",
    campaignType: "Pura 90 flagship launch with multi-brand telecom and retail collaboration",
    services: [
      "Creative concept development",
      "Cinematic AI TVC production",
      "AI-generated art",
      "Graphic design",
      "Social media campaign",
      "Multi-brand collaboration content",
    ],
    result:
      "Launched the Huawei Pura 90 in Kuwait with a cinematic AI TVC and coordinated collaboration posts across 6 telecom and electronics retailers, generating 1M+ views across social media.",
    facts: [
      { label: "Views", value: "1M+ across social media" },
      { label: "Deliverable", value: "Cinematic AI TVC + collaboration posts" },
      { label: "Partners", value: "6 telecom and retail brands" },
      { label: "Market", value: "Kuwait" },
      { label: "Client", value: "Huawei (2nd collaboration)" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Huawei needed to introduce the Pura 90 flagship phone to Kuwait in a way that felt locally relevant, while amplifying the launch through the country's telecom operators and electronics retailers.",
      },
      {
        title: "Idea",
        body:
          "Turn the phone's signature gradient color into a visual theme woven through Kuwait's identity — the water towers, desert, sea, old ships, and local people — so the launch felt native to the market rather than imported.",
      },
      {
        title: "Execution",
        body:
          "Astroshot produced a cinematic AI TVC where the Pura 90 flies across Kuwait's landscapes, turning heads past camels and the iconic towers. The same theme powered a collaboration campaign with six partners — Zain, Ooredoo, STC, Best AlYousifi, Xcite, and Eureka — using AI-generated art and static design, published from both Huawei's account and each partner's account.",
      },
      {
        title: "Result",
        body:
          "The launch generated 1M+ views across social media, secured Astroshot's second collaboration with Huawei, and delivered a locally grounded, culturally relevant product introduction that left the client highly satisfied.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Huawei Pura 90 Kuwait launch",
      "Huawei Kuwait campaign",
      "telecom collaboration campaign Kuwait",
      "cinematic AI TVC Kuwait",
      "AI video production Kuwait",
      "social media campaign Kuwait",
    ],
  },
  "3fe00e4f-058c-4ea4-8f6f-fc7749910213": {
    client: "National Geographic Ultimate Explorer",
    industry: "Entertainment park",
    location: "Kuwait",
    campaignType: "Bulk organic social video marketing",
    services: [
      "Organic video marketing",
      "Trendy reels production",
      "Short-form content strategy",
      "Instagram content",
      "TikTok content",
      "Facebook and YouTube content",
    ],
    result:
      "Generated 15.8M views through 30 entertaining organic videos published across Instagram, TikTok, Facebook, and YouTube.",
    facts: [
      { label: "Views", value: "15.8M" },
      { label: "Videos", value: "30 organic videos" },
      { label: "Platforms", value: "Instagram, TikTok, Facebook, YouTube" },
      { label: "Category", value: "Entertainment park campaign" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "National Geographic Ultimate Explorer Kuwait had low reach and weak engagement across its social channels, despite being an entertainment destination built around family fun and memorable experiences.",
      },
      {
        title: "Idea",
        body:
          "Fill the brand's social media with entertaining organic reels that felt native to each platform, making the park easier to discover, share, and connect with.",
      },
      {
        title: "Execution",
        body:
          "Astroshot delivered a bulk organic video marketing push: 30 trendy short-form videos published across Instagram, TikTok, Facebook, and YouTube.",
      },
      {
        title: "Result",
        body:
          "The campaign generated 15.8M views, built stronger audience connection, and turned the brand's channels into an active entertainment-led content stream.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "TikTok Agency Kuwait", href: "/tiktok-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "National Geographic Ultimate Explorer Kuwait",
      "entertainment park social media Kuwait",
      "organic video marketing Kuwait",
      "trendy reels campaign",
      "TikTok Instagram content Kuwait",
    ],
  },
  "86afd6d0-d79b-4a51-badb-33f6555d7b9e": {
    client: "Zad",
    industry: "Fintech and investment app",
    location: "Kuwait and GCC",
    campaignType: "Social media growth and fintech communication",
    services: [
      "Full social media retainer",
      "Social media management",
      "Marketing",
      "Content creation",
      "Production",
      "Creative campaign launches",
      "Motion graphics",
      "Rebranding support",
      "Animation",
      "Graphic design",
      "TV commercial production",
    ],
    result:
      "Supported Zad for 3+ years with a full social media, marketing, production, creative campaign, rebranding, animation, graphic, content, and TVC retainer.",
    facts: [
      { label: "Market", value: "Kuwait and GCC" },
      { label: "Retainer", value: "3+ years" },
      { label: "Scope", value: "SMM, marketing, production, TVC, rebranding" },
      { label: "Creative output", value: "Animation, graphics, content creation, campaign launches" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Zad needed more than occasional content. The brand needed a long-term communication partner that could explain investing clearly, support product launches, and keep credibility inside a regulated fintech category.",
      },
      {
        title: "Idea",
        body:
          "Build a full-retainer content and marketing engine that could turn complex stock market communication into simple, premium, trustworthy, and consistent social media output.",
      },
      {
        title: "Execution",
        body:
          "For 3+ years, Astroshot handled social media management, marketing, content creation, production, TVC work, creative campaign launches, rebranding, animation, graphic design, and ongoing visual communication.",
      },
      {
        title: "Result",
        body:
          "Zad gained a connected long-term content system that could explain products, support launches like Robo Zad, refresh brand communication, and keep the app visible across Kuwait and the GCC.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "fintech social media Kuwait",
      "social media management Kuwait",
      "GCC fintech content",
      "motion graphics campaign",
    ],
  },
  "6b82f234-6022-40b7-b5bb-ab1503fb6612": {
    client: "Waves App",
    industry: "Entertainment and booking app",
    location: "Kuwait, Dubai, Saudi Arabia and Qatar",
    campaignType: "App launch and regional social media growth",
    services: [
      "Full social media retainer",
      "Launch strategy",
      "Social media management",
      "Marketing",
      "Digital ads",
      "Motion graphics",
      "Video production",
      "Photography",
      "Graphic design",
      "Campaign content",
      "Creative campaign launches",
      "Brand development",
      "TVC",
      "Investor story support",
    ],
    result:
      "Handled Waves as a full monthly retainer for 5+ years, covering social media management, marketing, digital ads, production, content creation, graphics, motion graphics, brand development, creative campaign launches, and TVC.",
    facts: [
      { label: "Launch", value: "June 2021" },
      { label: "Retainer", value: "5+ years every month" },
      { label: "App downloads", value: "200K+" },
      { label: "Trips transacted", value: "13K" },
      { label: "Growth", value: "8x YoY growth" },
      { label: "Revenue run rate", value: "$1.6M May 2023" },
      { label: "Followers", value: "60K+" },
      { label: "App ranking", value: "#2 Entertainment App" },
      { label: "Countries present", value: "3" },
      { label: "Revenue streams", value: "6+" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Waves was building a new watercraft marketplace across Kuwait, Saudi Arabia, and Qatar. The app needed a long-term marketing partner to build trust, educate users, grow demand, support owners, run launches, and strengthen the fundraising story.",
      },
      {
        title: "Idea",
        body:
          "Treat Waves as a full retainer brand, not a single campaign: build the social, marketing, content, digital ads, production, graphics, motion, launch, and brand development layer around the platform every month.",
      },
      {
        title: "Execution",
        body:
          "For 5+ years, Astroshot handled Waves' social media management, marketing, digital ads, production, content creation, graphic design, motion graphics, brand development, creative campaign launches, TVC work, collaborations, and investor story assets.",
      },
      {
        title: "Result",
        body:
          "The long-term retainer helped Waves grow from launch into a regional platform, with 200K+ app downloads, 13K trips transacted, 8x YoY growth, a $1.6M May 2023 revenue run rate, 3 countries present, 6+ revenue streams, 60K+ followers, and regional expansion momentum.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Video Production Kuwait", href: "/video-production-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "app launch Kuwait",
      "social media growth GCC",
      "entertainment app marketing",
      "watercraft rental app GCC",
      "app fundraising story",
      "motion graphics Kuwait",
    ],
  },
  "af54cb11-578b-42e0-8ee6-6e506df391f4": {
    client: "Warba Bank",
    industry: "Banking and finance",
    location: "Kuwait",
    campaignType: "Waves card launch CGI awareness and motion graphics explainer campaign",
    services: [
      "CGI campaign film",
      "Motion graphics",
      "3D animation",
      "Scriptwriting",
      "Creative direction",
      "Storyboard development",
      "Banking product explainer content",
      "Social and paid media campaign content",
    ],
    result:
      "Created a two-part campaign for Warba Bank's Waves launch: a CGI awareness film across Kuwait landmarks and a fun animated Waves Wednesdays explainer used across organic and paid media.",
    facts: [
      { label: "Client", value: "Warba Bank" },
      { label: "Campaign", value: "Waves cards and Waves Wednesdays" },
      { label: "Market", value: "Kuwait" },
      { label: "Deliverables", value: "CGI awareness film + motion graphics explainer" },
      { label: "Usage", value: "Organic social and paid ads" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Warba Bank was launching Waves, a new card and account platform with a distinctive gradient card look. The bank needed to create awareness for the new cards, explain the benefits clearly, and communicate the Waves Wednesdays offer system in a way that felt relevant to a younger audience.",
      },
      {
        title: "Awareness Idea",
        body:
          "Astroshot created a CGI campaign film where the four Waves card designs moved through iconic Kuwait locations. The goal was to turn the card design itself into a visual event and make the new gradient cards feel impossible to miss.",
      },
      {
        title: "CGI Execution",
        body:
          "Each card had its own world. A purple card flew toward Kuwait Towers as purple flowers and color took over the landmark. An orange-to-blue card moved across Sheikh Jaber Al-Ahmad Bridge with gaming and pixel elements for a younger segment. Another card appeared over Kuwait City carried by branded balloons. The elegant silver card was projected above Sheikh Jaber Al-Ahmad Cultural Centre, where stars gathered to form the card in the sky.",
      },
      {
        title: "Waves Wednesdays",
        body:
          "After the awareness film, Astroshot produced a motion graphics and 3D animation video for Waves Wednesdays. The video used playful typography, animation, scriptwriting, and creative direction to explain the Wednesday benefits and offers in a way that was informative but still fun to watch.",
      },
      {
        title: "Result",
        body:
          "Warba Bank used both pieces across organic social and paid media, and shared the videos multiple times through its social channels. The campaign showed how a small number of strong content assets can do two jobs at once: build launch awareness and explain the product benefits clearly.",
      },
    ],
    proofLinks: [
      { label: "Motion Graphics Kuwait", href: "/motion-graphics-kuwait" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "Digital Marketing Agency Kuwait", href: "/digital-marketing-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Warba Bank Waves",
      "Waves Wednesday campaign",
      "banking CGI campaign Kuwait",
      "motion graphics Kuwait",
      "banking product explainer video",
      "CGI card launch campaign",
      "financial product animation Kuwait",
      "creative marketing agency Kuwait",
    ],
  },
  "92e3ae4c-dcd8-40c9-8064-41e4364fcf94": {
    client: "Jahez",
    industry: "Food delivery and technology",
    location: "Riyadh, Jeddah and Dhahran, Saudi Arabia",
    campaignType: "Three-city mixed reality CGI campaign",
    services: [
      "Mixed reality production",
      "CGI",
      "VFX compositing",
      "3D modeling",
      "Color grading",
      "Sound design",
    ],
    result: "Delivered three city-specific films in under one week and generated 80M+ total views.",
    facts: [
      { label: "Cities", value: "Riyadh, Jeddah, Dhahran" },
      { label: "Timeline", value: "Under one week" },
      { label: "Views", value: "80M+ total views" },
      { label: "Campaign", value: "180 Days of Free Delivery" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Jahez needed three high-impact mixed reality films across three Saudi cities, produced fast enough to support a major social campaign window.",
      },
      {
        title: "Idea",
        body:
          "Make the free delivery offer feel physically larger than life by blending recognizable city locations with CGI moments built for social sharing.",
      },
      {
        title: "Execution",
        body:
          "Astroshot moved through shooting, 3D modeling, VFX, compositing, color grading, sound design, and final delivery inside a compressed production sprint.",
      },
      {
        title: "Result",
        body:
          "The campaign delivered three location-specific films in less than seven days and generated 80M+ total views across social platforms.",
      },
    ],
    proofLinks: [
      { label: "Best CGI Agency Kuwait", href: "/best-cgi-agency-kuwait" },
      { label: "VFX Cost Kuwait", href: "/vfx-cost-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Jahez mixed reality campaign",
      "CGI campaign Saudi Arabia",
      "VFX agency GCC",
      "viral food delivery campaign",
    ],
  },
  "e6608da2-57f2-4007-ae60-a7615f20cca8": {
    client: "Flex",
    industry: "Fitness and wellness",
    location: "Kuwait",
    campaignType: "VIP branch launch social content campaign",
    services: [
      "Social content strategy",
      "Reels production",
      "Paid ad content",
      "Presenter-led content",
      "Cinematic gym content",
      "Trend-based reels",
      "Launch campaign support",
    ],
    result:
      "Produced a five-reel campaign for Flex's new VIP branch, built to support social media visibility, paid ads, sales inquiries, and footfall to the new location.",
    facts: [
      { label: "Deliverables", value: "5 campaign reels" },
      { label: "Objective", value: "Sales inquiries and branch footfall" },
      { label: "Channels", value: "Social media and paid ads" },
      { label: "Content mix", value: "Explainer, trend-based and cinematic reels" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Flex needed to launch its new VIP branch with content that could do more than show the space. The campaign had to explain the packages, make the facilities feel desirable, and create enough social momentum to support sales and footfall.",
      },
      {
        title: "Idea",
        body:
          "Build a compact five-reel social campaign where every piece of content had a role: explain the offer, stay relevant through trend-based formats, and use cinematic visuals to make the gym, pool, facilities, and VIP experience feel tangible.",
      },
      {
        title: "Execution",
        body:
          "Astroshot produced five reels for use across Flex's social media and ads. The content combined explanatory ad-style videos for packages and benefits, trend-based content for relevance, and cinematic facility-led reels showing the gym, details, pool, and customer experience.",
      },
      {
        title: "Result",
        body:
          "The launch had a focused social content system instead of a single announcement video, giving Flex multiple assets to promote the new VIP branch, communicate the offer, and drive audience interest across organic and paid channels.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Flex Kuwait VIP branch",
      "fitness social media campaign Kuwait",
      "gym reels production Kuwait",
      "paid ad content Kuwait",
      "social content agency Kuwait",
    ],
  },
  "75b5f863-7ba3-451c-9143-1866ac8ef07e": {
    client: "Gulf Bank",
    industry: "Banking and finance",
    location: "Kuwait",
    campaignType: "Marathon event coverage and social media management",
    services: [
      "Event coverage",
      "Press conference coverage",
      "Instagram management",
      "X management",
      "Live social updates",
      "Social media content creation",
      "Campaign communication support",
    ],
    result:
      "Supported the 2025 Gulf Bank Marathon with press conference coverage, on-ground event coverage, Instagram and X management, live updates, and social media content creation.",
    facts: [
      { label: "Event", value: "Gulf Bank Marathon 2025" },
      { label: "Scope", value: "Press conference and race-day coverage" },
      { label: "Platforms", value: "Instagram and X" },
      { label: "Role", value: "Live updates and social content creation" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Gulf Bank needed to communicate one of its major public events across social media in real time, covering the build-up, press conference, race-day moments, and live updates while keeping audiences informed and engaged.",
      },
      {
        title: "Idea",
        body:
          "Treat the marathon as a live social media story, not only an event recap. The communication needed to capture scale, energy, community participation, and the flow of updates across Instagram and X.",
      },
      {
        title: "Execution",
        body:
          "Astroshot covered the press conference, captured on-ground marathon content, created social media assets, managed Instagram and X updates, and helped Gulf Bank keep the audience connected before, during, and after the race.",
      },
      {
        title: "Result",
        body:
          "The 2025 Gulf Bank Marathon had a stronger digital communication layer, with event coverage and live platform management turning the marathon into active social content instead of a one-time offline event.",
      },
    ],
    proofLinks: [
      { label: "Event Coverage Kuwait", href: "/event-coverage-kuwait" },
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Gulf Bank Marathon 2025",
      "event coverage Kuwait",
      "banking social media Kuwait",
      "Instagram management Kuwait",
      "X management Kuwait",
      "marathon event content Kuwait",
    ],
  },
  "91c82031-e5d4-4aa0-9f84-a19076e8551a": {
    client: "Gulf Bank",
    industry: "Banking and finance",
    location: "Kuwait",
    campaignType: "One-year social media reels and campaign production partnership",
    services: [
      "Social media reels production",
      "Campaign concept development",
      "Scriptwriting",
      "Cinematic production",
      "Trend research",
      "Model hiring",
      "Editing",
      "Event coverage",
      "Motion graphics",
      "Banking app feature content",
    ],
    result:
      "Supported Gulf Bank across 2025 with cinematic, relatable social media reels for campaigns, app features, rewards communication, events and Al Dana content.",
    facts: [
      { label: "Client", value: "Gulf Bank" },
      { label: "Relationship", value: "1-year reels and campaign support" },
      { label: "Campaigns", value: "Eid, app features, rewards, events and Al Dana" },
      { label: "Production role", value: "Ideas, scripts, models, production, editing and research" },
      { label: "Recognition", value: "Eid video received a public thank-you from Gulf Bank on LinkedIn" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Gulf Bank needed a creative partner that could move quickly whenever a campaign or social media moment appeared. The bank wanted cinematic, relatable and engaging reels, but also needed a team experienced enough to handle banking content, production logistics and trend timing.",
      },
      {
        title: "Role",
        body:
          "Astroshot supported Gulf Bank as an always-available creative production team. Whenever the bank had a campaign, Astroshot helped with idea development, scripting, research, model hiring, production, editing and final delivery.",
      },
      {
        title: "Trend-Led Content",
        body:
          "The collaboration helped Gulf Bank stay close to social media culture. When a local trend started moving, Astroshot could propose a relevant concept immediately, helping the bank react early instead of arriving after the moment had passed.",
      },
      {
        title: "Campaign Support",
        body:
          "The work covered multiple campaign needs, including an Eid video that Gulf Bank loved and publicly appreciated on LinkedIn, reels for application features, rewards-program content, event coverage, social media management during events, and Al Dana campaign support.",
      },
      {
        title: "App and Rewards Communication",
        body:
          "Astroshot created multiple production videos showing how customers could benefit from Gulf Bank's application features and rewards program, turning functional product communication into simple, human, social-first content.",
      },
      {
        title: "Result",
        body:
          "Gulf Bank had a creative team beside them throughout the year: fast enough for trends, structured enough for full campaigns, and production-ready for events, reels, app communication, rewards content, Al Dana videos and animated countdown assets.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Event Coverage Kuwait", href: "/event-coverage-kuwait" },
      { label: "Motion Graphics Kuwait", href: "/motion-graphics-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Gulf Bank social media reels",
      "Gulf Bank Kuwait campaign content",
      "banking reels production Kuwait",
      "Gulf Bank Al Dana campaign",
      "banking app feature video Kuwait",
      "social media production Kuwait",
      "event coverage Kuwait",
      "motion graphics Kuwait",
      "creative marketing agency Kuwait",
    ],
  },
  "3d667587-3594-48ae-b86e-630b694a6ad4": {
    client: "Mercedes-Benz",
    industry: "Automotive and luxury",
    location: "Dubai, Abu Dhabi, Kuwait, Riyadh and Qatar",
    campaignType: "Regional GCC mixed reality automotive launch",
    services: [
      "Creative concept development",
      "Storyboard development",
      "Mixed reality production",
      "CGI",
      "VFX compositing",
      "Influencer campaign content",
    ],
    result: "Produced five city-specific mixed reality films for the G-Class G 63 and Electric G-Class GCC launch.",
    facts: [
      { label: "Cities", value: "5 GCC cities" },
      { label: "Vehicles", value: "G-Class G 63 and Electric G-Class" },
      { label: "Partner", value: "Produced in collaboration with Team X" },
      { label: "Format", value: "Social-first films around 12 seconds" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Mercedes-Benz needed content that protected the premium character of the G-Class while still creating unexpected social moments across several markets.",
      },
      {
        title: "Idea",
        body:
          "Build a different mixed reality and CGI execution around a recognizable location in each city, keeping the campaign cohesive across the GCC.",
      },
      {
        title: "Execution",
        body:
          "Astroshot developed concepts and storyboards with Team X, captured footage across five GCC locations, then combined each scene with CGI and VFX.",
      },
      {
        title: "Result",
        body:
          "The launch became a five-city regional content system for Dubai, Abu Dhabi, Kuwait, Riyadh, and Qatar, built specifically for luxury automotive social media.",
      },
    ],
    proofLinks: [
      { label: "Automotive Marketing Kuwait", href: "/automotive-marketing-kuwait" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Mercedes-Benz G-Class GCC launch",
      "automotive CGI campaign",
      "mixed reality automotive marketing",
      "luxury car launch GCC",
    ],
  },
  "ffaf1397-28be-46b7-8372-c69aa9af09e4": {
    client: "Honda Alghanim",
    industry: "Automotive",
    location: "Kuwait",
    campaignType: "Mixed reality vehicle launch",
    services: [
      "Creative strategy",
      "Mixed reality production",
      "CGI",
      "VFX compositing",
      "Social-first editing",
      "Campaign launch content",
    ],
    result: "Generated 51M+ organic views and 965K total engagements for the Honda Pilot launch.",
    facts: [
      { label: "Views", value: "51M+ organic views" },
      { label: "Engagements", value: "965K total engagements" },
      { label: "Market", value: "Kuwait" },
      { label: "Known proof", value: "Honda's most organically viral social video globally*" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Honda Alghanim needed the Honda Pilot launch to stand out in a category crowded with polished automotive commercials.",
      },
      {
        title: "Idea",
        body:
          "Use a short, realistic mixed reality moment that made viewers question whether the scene was real, turning curiosity into organic reach.",
      },
      {
        title: "Execution",
        body:
          "Astroshot combined real footage, CGI, VFX compositing, and social-first pacing to create a 10-second launch piece built for retention and sharing.",
      },
      {
        title: "Result",
        body:
          "The campaign reached 51M+ organic views, 965K total engagements, and carried a Kuwait-produced Honda launch far beyond its original market.",
      },
    ],
    proofLinks: [
      { label: "Automotive Marketing Kuwait", href: "/automotive-marketing-kuwait" },
      { label: "VFX Agency Kuwait", href: "/vfx-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Honda Pilot Kuwait launch",
      "automotive VFX Kuwait",
      "viral automotive campaign",
      "mixed reality CGI Kuwait",
    ],
  },
  "17c5e8a2-48f0-4119-b10a-d5c9986e5f34": {
    client: "Hongqi Alghanim",
    industry: "Automotive",
    location: "Kuwait",
    campaignType: "HS9 mixed reality and VFX campaign",
    services: [
      "Creative concept development",
      "Mixed reality production",
      "VFX compositing",
      "Automotive social content",
      "Social-first editing",
    ],
    result:
      "Generated over 100,000 organic views with a mixed reality Hongqi HS9 campaign built around stability, smoothness, and instant visual attention.",
    facts: [
      { label: "Views", value: "100K+ organic views" },
      { label: "Vehicle", value: "Hongqi HS9" },
      { label: "Location", value: "Gulf Road, Kuwait" },
      { label: "Format", value: "Mixed reality VFX campaign" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Hongqi needed an automotive campaign that could create fast attention for the HS9 in Kuwait and communicate the car's smooth ride and stability in a way that felt more memorable than a standard driving video.",
      },
      {
        title: "Idea",
        body:
          "Turn the stability message into a surreal mixed reality moment: two Hongqi HS9 cars driving smoothly side by side while a man in dishdasha stands balanced on a platform connecting both vehicles.",
      },
      {
        title: "Execution",
        body:
          "Astroshot filmed on Gulf Road and shaped the final campaign with VFX compositing and social-first pacing, making the concept feel bold while keeping the car at the center of the visual.",
      },
      {
        title: "Result",
        body:
          "The campaign generated over 100,000 organic views and became a strong example of attention-driven automotive content for Hongqi in Kuwait.",
      },
    ],
    proofLinks: [
      { label: "Automotive Marketing Kuwait", href: "/automotive-marketing-kuwait" },
      { label: "VFX Agency Kuwait", href: "/vfx-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Hongqi HS9 Kuwait",
      "Hongqi VFX campaign",
      "automotive mixed reality Kuwait",
      "car campaign Kuwait",
      "VFX automotive content",
    ],
  },
  "5a860eeb-fd7f-47c9-b3b8-2a2e3703ca46": {
    client: "BYD",
    industry: "Automotive",
    location: "Kuwait and Middle East",
    campaignType: "BYD Seal showroom mixed reality CGI launch campaign",
    services: [
      "Creative concept development",
      "Mixed reality production",
      "CGI",
      "VFX compositing",
      "Automotive launch content",
      "Social-first editing",
    ],
    result:
      "Generated 6.2M organic views with a BYD Seal launch video where the showroom car changed color to match each model's outfit.",
    facts: [
      { label: "Views", value: "6.2M organic views" },
      { label: "Reach", value: "6M+ organic reach" },
      { label: "Shares", value: "76K+ shares" },
      { label: "Saves", value: "29K+ saves" },
      { label: "Likes", value: "275K+ likes" },
      { label: "Comments", value: "4.8K+ comments" },
      { label: "Media spend", value: "No ad spend" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "BYD was launching the Seal in Kuwait and needed a campaign that could create a loud social media moment, not just another showroom reveal. The goal was awareness, engagement, and organic virality around the new car.",
      },
      {
        title: "Idea",
        body:
          "Astroshot proposed a short mixed reality CGI film inside the BYD showroom. Multiple models walked past the Seal wearing different outfit colors, and every time a model came close, the car changed color to match the outfit.",
      },
      {
        title: "Execution",
        body:
          "The video was shot with an organic, almost casual showroom feel so the audience would question whether the moment was real. The final piece ran around eight seconds, using CGI and VFX compositing to make the color change feel immediate, playful, and believable.",
      },
      {
        title: "Result",
        body:
          "The launch generated 6.2M organic views with no ad spend, reached more than 6M people organically, and became BYD's most organically viewed video in the Middle East. It also drove around 4,800 comments, 29K saves, 76K shares, and 275K likes.",
      },
      {
        title: "Audience Reaction",
        body:
          "The comment section became part of the campaign. Viewers debated the color-changing car, made jokes about police, registration, and insurance confusion, and turned the idea into meme-style entertainment that kept the content moving beyond Kuwait.",
      },
    ],
    proofLinks: [
      { label: "Automotive Marketing Kuwait", href: "/automotive-marketing-kuwait" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "VFX Agency Kuwait", href: "/vfx-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "BYD Seal Kuwait launch",
      "BYD Seal mixed reality campaign",
      "automotive CGI campaign Kuwait",
      "viral car campaign Middle East",
      "VFX automotive content",
      "mixed reality CGI campaign",
      "creative marketing agency Kuwait",
      "social media campaign Kuwait",
      "viral campaign GCC",
    ],
  },
  "5d735a9b-d0a6-44c5-8c50-9f726ac27d09": {
    client: "ZAL",
    industry: "Luxury interiors and carpets",
    location: "Kuwait",
    campaignType: "Luxury social media management and content creation",
    services: [
      "Social media management",
      "Luxury content creation",
      "Monthly content production",
      "Cinematic production",
      "AI-powered visual production",
      "Brand positioning",
    ],
    result:
      "Repositioned ZAL's social presence as a luxury carpet brand, increasing engagement 2x in the first month and 3x by the second month.",
    facts: [
      { label: "Month 1", value: "2x engagement increase" },
      { label: "Month 2", value: "3x engagement increase" },
      { label: "Client", value: "ZAL" },
      { label: "Market", value: "Kuwait" },
      { label: "Relationship", value: "Ongoing monthly production" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "ZAL wanted a consistent luxury presence across its social media channels. The brand's ambition was not only to look premium in Kuwait, but to become the leading luxury carpet brand in the Middle East for online presence and positioning.",
      },
      {
        title: "Strategy",
        body:
          "Astroshot built the social media management and content creation direction around luxury, cinematic visuals, refined locations, and a stronger sense of brand world. The goal was to make every touchpoint feel elevated, consistent, and clearly positioned.",
      },
      {
        title: "Execution",
        body:
          "From the first month, Astroshot changed the way ZAL appeared on social media with high-end content across multiple locations. The production model combined real shoots, models, cinematic direction, and AI-powered visual production where it helped the brand look more premium and flexible.",
      },
      {
        title: "Result",
        body:
          "ZAL's engagement increased 2x in the first month and 3x by the second month. The brand was extremely happy with the new luxury positioning, and Astroshot continues to produce monthly social media content for ZAL.",
      },
    ],
    proofLinks: [
      { label: "Instagram Management Kuwait", href: "/instagram-management-kuwait" },
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "ZAL luxury carpet Kuwait",
      "luxury social media management Kuwait",
      "luxury brand content creation",
      "social media agency Kuwait",
      "AI content production Kuwait",
      "luxury interiors social media",
      "creative marketing agency Kuwait",
      "social media campaign Kuwait",
    ],
  },
  "8f5b1ee5-fa5a-4f9b-8dbb-fb60e9c1a8e4": {
    client: "Bel Elan",
    industry: "Fitness, wellness and lifestyle",
    location: "Kuwait",
    campaignType: "Ladies' fitness studio launch, branding and social media management",
    services: [
      "CGI launch campaign",
      "Brand development",
      "Brand guidelines",
      "Social media management",
      "Content creation",
      "Print material design",
      "Organic social video production",
    ],
    result:
      "Launched Bel Elan in Kuwait with a CGI video that generated 1M+ organic views across Instagram and TikTok, then built the brand and managed its social media for one year.",
    facts: [
      { label: "Views", value: "1M+ organic views" },
      { label: "Platforms", value: "Instagram and TikTok" },
      { label: "Market", value: "Kuwait" },
      { label: "Studio type", value: "Ladies' fitness studio" },
      { label: "Management", value: "1 year of social media management" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Bel Elan was preparing to launch a ladies' fitness studio in Kuwait and needed immediate social media awareness. Beyond launch buzz, the brand wanted to be positioned as a high-end destination for Pilates, dance classes, and women's fitness experiences.",
      },
      {
        title: "Launch Idea",
        body:
          "Astroshot created a CGI launch concept built for organic attention: a large truck moving through Kuwait streets with a transparent glass room on the back, where women were exercising inside as if the studio experience had been placed in public view.",
      },
      {
        title: "Execution",
        body:
          "The launch video was shaped to feel as if people in nearby cars had filmed the truck naturally while it passed through the city. This made the CGI moment feel believable, surprising, and easy to share across Instagram and TikTok.",
      },
      {
        title: "Brand Development",
        body:
          "After the launch, Astroshot developed Bel Elan's brand system, including brand personality, brand patterns, company profile, brochures, flyers, brand voice, brand direction, brand guidelines, business cards, gifts, gift cards, and studio print materials such as billboards, banners, registration cards, and flyers.",
      },
      {
        title: "Social Media Management",
        body:
          "Astroshot then managed Bel Elan's social media for one year, handling strategy, content creation, stories, posting, publishing, production videos, organic videos, graphical content, and Instagram communication that showed the experience and feeling of the studio.",
      },
      {
        title: "Result",
        body:
          "The CGI launch video generated 1M+ organic views across Instagram and TikTok and created major awareness for Bel Elan in Kuwait. The work positioned the studio as a polished, high-end destination and supported the brand through launch and ongoing social media growth.",
      },
    ],
    proofLinks: [
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Branding Agency Kuwait", href: "/branding-agency-kuwait" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Bel Elan Kuwait",
      "fitness studio launch Kuwait",
      "ladies gym social media Kuwait",
      "Pilates studio marketing Kuwait",
      "CGI launch campaign Kuwait",
      "branding agency Kuwait",
      "social media management Kuwait",
      "creative marketing agency Kuwait",
      "viral campaign Kuwait",
    ],
  },
  "538cfc1a-2790-40bf-98f8-7793785ec390": {
    client: "National Bank of Kuwait",
    industry: "Banking and finance",
    location: "Kuwait",
    campaignType: "Johara account explanatory motion graphics campaign",
    services: [
      "Campaign communication strategy",
      "Motion graphics",
      "Infographic animation",
      "Scriptwriting",
      "Storyboard development",
      "Voice-over direction",
      "Financial product explainer videos",
    ],
    result:
      "Created a series of explanatory motion graphic videos that helped NBK communicate the upgraded Johara account features clearly across social media and ads.",
    facts: [
      { label: "Client", value: "National Bank of Kuwait" },
      { label: "Campaign", value: "Johara got bigger" },
      { label: "Deliverables", value: "Around 4 motion graphic videos" },
      { label: "Usage", value: "Social media and ads" },
      { label: "Outcome", value: "Led to more NBK animation campaigns" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "NBK had upgraded Johara, its prize and draw account, with more features and audience-specific benefits. The bank needed to explain what changed, how the account worked, and why different customer segments should care — without making the communication feel complicated.",
      },
      {
        title: "Strategy",
        body:
          "Astroshot proposed a clear explanatory motion graphics direction: elegant infographic-style videos that could simplify the upgraded Johara account and make each feature easier to understand across social media and paid ads.",
      },
      {
        title: "Product Context",
        body:
          "Johara combines saving behavior with prize-draw mechanics, including weekly, monthly, and grand-prize draws, plus related mechanics such as Johara Junior, saving-account features, loyalty opportunities, and double-chance eligibility. This made clarity the most important creative requirement.",
      },
      {
        title: "Execution",
        body:
          "Astroshot produced around four motion graphic animation videos for NBK. Each video focused on a different audience or feature angle, explaining how Johara works, what had been added, and what customers needed to understand in a direct, visually polished way.",
      },
      {
        title: "Full Production",
        body:
          "The scope covered the full video process from A to Z: scriptwriting, storyboards, animation, voice-over direction, creative direction, and final video production.",
      },
      {
        title: "Result",
        body:
          "The campaign was successfully used by NBK across social media and ads to communicate how Johara got bigger. It also opened the door for Astroshot to work on multiple additional NBK animation and motion graphic campaigns, especially for digital banking, app features, accounts, and card communication.",
      },
    ],
    proofLinks: [
      { label: "Motion Graphics Kuwait", href: "/motion-graphics-kuwait" },
      { label: "Digital Marketing Agency Kuwait", href: "/digital-marketing-agency-kuwait" },
      { label: "Content Creation Kuwait", href: "/content-creation-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "NBK Johara campaign",
      "National Bank of Kuwait motion graphics",
      "banking explainer video Kuwait",
      "financial product animation Kuwait",
      "motion graphics Kuwait",
      "infographic animation Kuwait",
      "digital banking content Kuwait",
      "creative marketing agency Kuwait",
    ],
  },
  "80e0bb66-2856-4e9a-b938-8c993781b085": {
    client: "Commercial Bank of Kuwait",
    industry: "Banking and finance",
    location: "Kuwait",
    campaignType: "Long-term social media content, motion graphics and 3D animation support",
    services: [
      "Social media content",
      "3D animation",
      "Motion graphics",
      "Video production",
      "Static artwork",
      "Campaign content",
      "Banking product explainer videos",
      "Branch-screen content",
      "Print material design",
    ],
    result:
      "Supported Commercial Bank of Kuwait for around three years with high-end social media content, animation, video production, static artwork and campaign assets, including a salary transfer campaign that reached almost half a million organic views.",
    facts: [
      { label: "Client", value: "Commercial Bank of Kuwait" },
      { label: "Relationship", value: "Around 3 years" },
      { label: "Scope", value: "3D, motion, video, static art, print and branch screens" },
      { label: "Campaign proof", value: "Salary transfer campaign reached almost 500K organic views" },
      { label: "Usage", value: "Social media, ads and branch screens" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Commercial Bank of Kuwait needed a fast, reliable content partner that could support banking communication across many formats. The bank frequently needed to explain cards, app features, ATM services, cash withdrawal machines, branch announcements, Mastercard benefits, seasonal campaigns and product offers.",
      },
      {
        title: "Role",
        body:
          "Astroshot supported CBK for around three years as a social media content partner, providing high-end animation, motion graphics, video production, static artwork, brochures, flyers, billboards and social media assets.",
      },
      {
        title: "Dedicated Animation Support",
        body:
          "Because CBK had many explanatory requests, Astroshot dedicated animation support to the brand. This allowed the bank to turn technical product and service details into clear, polished, easy-to-understand videos for customers.",
      },
      {
        title: "Campaign Work",
        body:
          "The collaboration covered multiple campaigns and content needs, including Ramadan video production, a full 3D donation campaign, new branch announcements such as Khairan, Mastercard benefit communication, and a salary transfer campaign.",
      },
      {
        title: "Multi-Use Content",
        body:
          "The assets were not limited to social media. CBK also used videos and static content across ads and branch screens, giving each piece more utility across customer touchpoints.",
      },
      {
        title: "Result",
        body:
          "The long collaboration gave CBK speed, quality and variation across banking content. The salary transfer campaign reached almost half a million organic views, and the bank had a dependable creative partner whenever it needed high-end graphics, video, motion graphics or animation.",
      },
    ],
    proofLinks: [
      { label: "Motion Graphics Kuwait", href: "/motion-graphics-kuwait" },
      { label: "Video Production Kuwait", href: "/video-production-kuwait" },
      { label: "Social Media Agency Kuwait", href: "/social-media-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Commercial Bank of Kuwait content",
      "CBK social media content",
      "banking motion graphics Kuwait",
      "banking animation Kuwait",
      "financial product explainer video",
      "3D animation Kuwait",
      "banking campaign Kuwait",
      "creative marketing agency Kuwait",
    ],
  },
  "a334e81b-de88-4526-a8f8-05eb9bb75bcb": {
    client: "Hongqi Alghanim",
    industry: "Automotive",
    location: "Kuwait",
    campaignType: "HS5 and HS3 launch content system using CGI and AI production",
    services: [
      "Creative campaign direction",
      "AI-powered film production",
      "CGI vehicle production",
      "AI model creation",
      "Cinematic editing",
      "Social and paid ad adaptations",
    ],
    result:
      "A five-video launch system for the Hongqi HS5 and HS3 that delivered premium automotive lifestyle content without the cost of a heavy traditional production.",
    facts: [
      { label: "Deliverables", value: "5 launch videos" },
      { label: "Models", value: "Kuwaiti AI and real talent mix" },
      { label: "Market", value: "Kuwait" },
      { label: "Usage", value: "Organic social and paid ads" },
      { label: "Production model", value: "CGI + AI instead of heavy production" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Hongqi wanted to launch the HS5 and HS3 in Kuwait with multiple videos that showed the cars through aspirational audience lifestyles, locations, and emotional driving experiences. The creative ambition called for family, city, lifestyle, trend, and entrepreneur-led stories, but producing every scenario traditionally would have required a much higher budget.",
      },
      {
        title: "Idea",
        body:
          "Use CGI and AI production to unlock the campaign scale without forcing the client into a heavy shoot. Instead of reducing the creative idea to fit the budget, Astroshot built a smarter production model: realistic CGI cars, Kuwaiti AI models, real talent where useful, and cinematic direction across different lifestyle scenarios.",
      },
      {
        title: "Execution",
        body:
          "Astroshot created a five-part launch content system: a family travel story with villa, yacht, jet ski, and road-trip moments; an elegant Kuwait City drive across key urban scenes including the bridge; a Gen Z trend-led video to stay culturally relevant; employee-generated-style content to build connection with the team behind Hongqi; and a male entrepreneur lifestyle film connecting the car to gym, coffee shop, office, and daily ambition.",
      },
      {
        title: "Result",
        body:
          "The campaign gave Hongqi premium launch content that looked like a full-scale real production while staying within the available budget. The assets were used across organic social media and paid digital ads, with multiple adaptations prepared for performance use.",
      },
    ],
    proofLinks: [
      { label: "Automotive Marketing Kuwait", href: "/automotive-marketing-kuwait" },
      { label: "AI Video Production GCC", href: "/ai-video-production-gcc" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Hongqi HS5 Kuwait launch",
      "Hongqi HS3 Kuwait launch",
      "automotive CGI Kuwait",
      "AI car campaign Kuwait",
      "automotive marketing Kuwait",
      "CGI car production GCC",
    ],
  },
  "cd1054ac-85f2-47df-bcbb-ff3207bb374b": {
    client: "Warehouse Mall",
    industry: "Retail and destination launch",
    location: "Kuwait",
    campaignType: "Mall launch mixed reality campaign and social media presence",
    services: [
      "Campaign concept",
      "Mixed reality production",
      "CGI",
      "VFX compositing",
      "Launch video production",
      "Social media presence building",
    ],
    result: "Generated 4.5M+ views and helped turn a mall opening into a recognizable Kuwait launch moment.",
    facts: [
      { label: "Views", value: "4.5M+ views" },
      { label: "Client", value: "Tamdeen Group / Warehouse Mall" },
      { label: "Market", value: "Kuwait" },
      { label: "Campaign role", value: "Launch video plus social media presence" },
    ],
    sections: [
      {
        title: "Challenge",
        body:
          "Warehouse Mall needed immediate launch awareness while also establishing how the destination would communicate across social media after opening.",
      },
      {
        title: "Idea",
        body:
          "Create curiosity before the reveal through a first-person mixed reality journey: Kuwait road, camels, green portal, sky fall, and mall reveal.",
      },
      {
        title: "Execution",
        body:
          "Astroshot developed the launch concept, produced the mixed reality CGI film, and supported the new mall with social media content direction.",
      },
      {
        title: "Result",
        body:
          "The launch teaser generated 4.5M+ views and gave Warehouse Mall a distinctive visual identity for its first wave of public attention.",
      },
    ],
    proofLinks: [
      { label: "Creative Agency Kuwait", href: "/creative-agency-kuwait" },
      { label: "CGI Agency Kuwait", href: "/cgi-agency-kuwait" },
      { label: "Contact Astroshot", href: "/contact" },
    ],
    keywords: [
      "Warehouse Mall Kuwait launch",
      "mall launch campaign Kuwait",
      "retail mixed reality campaign",
      "CGI marketing Kuwait",
    ],
  },
};

export function getCaseStudyData(projectId: string) {
  return caseStudyDataByProjectId[projectId] ?? null;
}

export function getCaseStudyDataForProject(project: ProjectCaseStudyInput) {
  return getCaseStudyData(project.id) ?? buildFallbackCaseStudyData(project);
}
