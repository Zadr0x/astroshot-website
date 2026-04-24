import type { Metadata } from "next";
import Script from "next/script";
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
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon.ico",
  },
  verification: {
    google: "vnUZBj22MNq3TqcMmch9pFtrWgFTnmYmtwOHZgec0H8",
  },
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

const GA_MEASUREMENT_ID = "G-5B824FT2C6";
const META_PIXEL_ID = "1732638231438322";

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
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${META_PIXEL_ID}');
            fbq('track', 'PageView');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#050505] text-[#FAFAFA]">
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
