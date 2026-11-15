import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { companyInfo } from "@/lib/company-info";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description:
    "Terms and conditions for Astroshot LLC services, website use, project approvals, payments, and client responsibilities.",
  alternates: {
    canonical: "https://astroshotmedia.com/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms & Conditions"
      updatedAt="August 13, 2026"
      intro={`These Terms & Conditions apply to the Astroshot website and to services provided by ${companyInfo.legalName}, a Wyoming limited liability company.`}
      sections={[
        {
          title: "Company Information",
          body: [
            `${companyInfo.legalName} is registered in ${companyInfo.stateOfFormation}, United States. LLC address: ${companyInfo.addressLines.join(", ")}. EIN: ${companyInfo.ein}.`,
            `You can contact us at ${companyInfo.email} or ${companyInfo.phoneDisplay}.`,
          ],
        },
        {
          title: "Services",
          body: [
            "Astroshot provides creative production, VFX, CGI, 3D animation, branding, content production, campaign development, and related project management services.",
            "The exact scope, deliverables, timeline, approvals, payment schedule, and included revisions are defined in the accepted proposal, quotation, invoice, contract, or written project confirmation for each client.",
          ],
        },
        {
          title: "Client Responsibilities",
          body: [
            "Clients are responsible for providing accurate project information, brand assets, approvals, access, feedback, and any required third-party permissions on time.",
            "Delays in approvals, materials, payments, or access may affect delivery dates and may require timeline or cost adjustments.",
          ],
        },
        {
          title: "Payments",
          body: [
            "Fees, payment milestones, and billing currency are stated in the applicable proposal, quotation, invoice, or agreement.",
            "Unless stated otherwise in writing, work may begin only after the required upfront payment is received. Late payments may pause production, delivery, publishing, or file handover.",
          ],
        },
        {
          title: "Approvals And Revisions",
          body: [
            "Client feedback should be consolidated and delivered in writing. Revisions are limited to the number included in the project scope unless otherwise agreed.",
            "Requests outside the approved scope, after final approval, or after delivery may be quoted separately.",
          ],
        },
        {
          title: "Intellectual Property",
          body: [
            "Unless otherwise stated in a signed agreement, final approved deliverables are licensed or transferred to the client after full payment is received.",
            "Astroshot may retain ownership of working files, project files, source files, unused concepts, templates, tools, workflows, and production methods unless their transfer is expressly included in writing.",
          ],
        },
        {
          title: "Third-Party Costs",
          body: [
            "Third-party costs such as media buying, talent, models, locations, studio rental, voice-over, music licensing, stock assets, platform fees, travel, and paid tools are not included unless stated in writing.",
            "Clients are responsible for approving and paying these costs before they are incurred.",
          ],
        },
        {
          title: "Website Use",
          body: [
            "You may use this website for lawful purposes only. You may not attempt to disrupt, misuse, scrape abusively, reverse engineer, or gain unauthorized access to the website or connected systems.",
            "Website content, case studies, visuals, copy, layout, and branding may not be copied or reused without written permission.",
          ],
        },
        {
          title: "Limitation Of Liability",
          body: [
            "To the maximum extent permitted by law, Astroshot is not liable for indirect, incidental, special, consequential, or lost-profit damages arising from website use or services.",
            "Astroshot's total liability for a project is limited to the amount paid by the client for the specific service giving rise to the claim, unless applicable law requires otherwise.",
          ],
        },
        {
          title: "Changes",
          body: [
            "We may update these Terms & Conditions from time to time. The updated version will be posted on this page with a revised date.",
          ],
        },
      ]}
    />
  );
}
