import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import WhatsAppButton from "@/components/WhatsAppButton";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Astroshot | Kuwait's #1 VFX & Creative Agency",
    template: "%s | Astroshot",
  },
  description:
    "Astroshot is Kuwait's leading VFX, CGI, and creative marketing agency. 500M+ organic views. Serving Mercedes, Gulf Bank, Honda & 170+ brands across the GCC.",
  keywords: [
    "VFX Kuwait",
    "CGI videos Kuwait",
    "marketing agency Kuwait",
    "AI marketing Kuwait",
    "commercial video production Kuwait",
    "social media marketing Kuwait",
    "3D animation Kuwait",
    "creative agency GCC",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://astroshotmedia.com",
    siteName: "Astroshot",
    title: "Astroshot | Kuwait's #1 VFX & Creative Agency",
    description:
      "Kuwait's leading VFX, CGI, and creative marketing agency. 500M+ organic views across the GCC.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Astroshot | Kuwait's #1 VFX & Creative Agency",
    description:
      "Kuwait's leading VFX, CGI, and creative marketing agency. 500M+ organic views across the GCC.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Astroshot Project Management Company",
  url: "https://astroshotmedia.com",
  description:
    "Kuwait's leading VFX, CGI, and creative marketing agency serving brands across the GCC",
  address: {
    "@type": "PostalAddress",
    streetAddress:
      "Qibla Block 13, Fahad Al Salem Street, Al Salam Tower, 16th Floor, Office 7",
    addressLocality: "Kuwait City",
    addressCountry: "KW",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+965-9333-6065",
    email: "info@astroshotpm.com",
  },
  sameAs: ["https://www.instagram.com/astroshotmedia"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#050505] text-[#FAFAFA]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
