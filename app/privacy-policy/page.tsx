import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { companyInfo } from "@/lib/company-info";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy policy for Astroshot LLC, covering website inquiries, client communications, analytics, and service-related data.",
  alternates: {
    canonical: "https://astroshotmedia.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updatedAt="August 13, 2026"
      intro={`${companyInfo.legalName} respects privacy and uses personal information only for legitimate business, communication, service delivery, website, and compliance purposes.`}
      sections={[
        {
          title: "Company Information",
          body: [
            `${companyInfo.legalName} is a Wyoming limited liability company. LLC address: ${companyInfo.addressLines.join(", ")}. EIN: ${companyInfo.ein}.`,
            `For privacy questions, contact ${companyInfo.email}.`,
          ],
        },
        {
          title: "Information We Collect",
          body: [
            "We may collect information you submit through forms, emails, calls, WhatsApp, social media messages, project briefs, invoices, contracts, client portals, and other business communications.",
            "This may include name, company name, email address, phone number, project details, billing details, files, creative references, brand assets, and communication history.",
          ],
        },
        {
          title: "Website And Analytics Data",
          body: [
            "We may collect website usage data such as pages visited, device type, browser, approximate location, referral source, and interaction events through analytics and advertising tools.",
            "This helps us understand performance, improve the website, measure campaigns, and prevent misuse.",
          ],
        },
        {
          title: "How We Use Information",
          body: [
            "We use information to respond to inquiries, prepare proposals, deliver services, manage client relationships, process payments, improve our website, protect our systems, comply with legal obligations, and communicate about relevant services.",
          ],
        },
        {
          title: "Sharing Information",
          body: [
            "We may share information with trusted service providers who help us operate our website, communications, payments, analytics, production, storage, contracts, and business systems.",
            "We may also share information when required by law, regulation, legal process, or to protect the rights, safety, and security of Astroshot, our clients, or others.",
          ],
        },
        {
          title: "Cookies And Tracking",
          body: [
            "Our website may use cookies, pixels, and similar technologies for analytics, performance, advertising measurement, and basic site functionality.",
            "You can control cookies through your browser settings. Some website features may not work correctly if cookies are disabled.",
          ],
        },
        {
          title: "Data Retention",
          body: [
            "We keep personal information for as long as needed for the purposes described in this policy, including service delivery, business records, legal compliance, dispute resolution, and legitimate operational needs.",
          ],
        },
        {
          title: "Security",
          body: [
            "We use reasonable technical and organizational measures to protect information. No method of transmission or storage is completely secure, so we cannot guarantee absolute security.",
          ],
        },
        {
          title: "Your Choices",
          body: [
            `You may contact us at ${companyInfo.email} to request access, correction, deletion, or restriction of your personal information, subject to identity verification and legal or operational limits.`,
          ],
        },
        {
          title: "Changes",
          body: [
            "We may update this Privacy Policy from time to time. The latest version will be posted on this page with a revised date.",
          ],
        },
      ]}
    />
  );
}
