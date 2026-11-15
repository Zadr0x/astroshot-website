import type { Metadata } from "next";
import { companyInfo } from "@/lib/company-info";

export const siteUrl = "https://astroshotmedia.com";
export const defaultSocialImage = {
  url: "/og/astroshot-social-preview.png",
  width: 1200,
  height: 630,
  alt: "Astroshot creative campaign and content agency in Kuwait",
};

export function socialMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Pick<Metadata, "openGraph" | "twitter"> {
  const url = `${siteUrl}${path}`;

  return {
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: "Astroshot",
      title,
      description,
      images: [defaultSocialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [defaultSocialImage.url],
    },
  };
}

export const kuwaitOffice = {
  "@type": "PostalAddress",
  streetAddress:
    "Qibla Block 13, Fahad Al Salem Street, Al Salam Tower, 16th Floor, Office No 7",
  addressLocality: "Kuwait City",
  addressCountry: "KW",
};

export const serviceAreas = [
  { "@type": "Country", name: "Kuwait" },
  { "@type": "Country", name: "Saudi Arabia" },
  { "@type": "Country", name: "United Arab Emirates" },
  { "@type": "Place", name: "GCC" },
];

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService"],
  "@id": `${siteUrl}/#organization`,
  name: "Astroshot",
  legalName: companyInfo.legalName,
  url: siteUrl,
  description:
    "Astroshot is a creative campaign and content agency in Kuwait, working with brands across the GCC. We develop the idea, shape the message and produce the films and social content that bring it to life.",
  slogan: "Creative campaigns. Cinematic content. Impossible to ignore.",
  foundingDate: "2018",
  email: companyInfo.email,
  telephone: companyInfo.phoneDisplay,
  address: kuwaitOffice,
  areaServed: serviceAreas,
  logo: {
    "@type": "ImageObject",
    url: `${siteUrl}/apple-touch-icon.png`,
    width: 180,
    height: 180,
  },
  image: `${siteUrl}/apple-touch-icon.png`,
  geo: {
    "@type": "GeoCoordinates",
    latitude: 29.3628516,
    longitude: 47.9651707,
  },
  hasMap: "https://www.google.com/maps?q=29.3628516,47.9651707",
  foundingLocation: {
    "@type": "Place",
    name: "Kuwait City, Kuwait",
  },
  sameAs: [companyInfo.instagramUrl, "https://www.tiktok.com/@astroshotmedia"],
  knowsAbout: [
    "VFX",
    "CGI",
    "3D Animation",
    "Mixed Reality",
    "AI Content",
    "Social Media Management",
    "Branding",
    "Video Production",
    "Creative Campaigns",
    "Creative Campaigns Kuwait",
    "GCC Creative Campaigns",
  ],
};

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: "Astroshot",
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}/#organization`,
    },
    inLanguage: "en",
  };
}

export function serviceSchema({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@id": `${siteUrl}/#organization`,
    },
    areaServed: serviceAreas,
    serviceType: name,
  };
}

export function faqSchema(faqs: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    })),
  };
}
