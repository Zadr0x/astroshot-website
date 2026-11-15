import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { companyInfo } from "@/lib/company-info";

export const metadata: Metadata = {
  title: "Refund Policy",
  description:
    "Refund policy for Astroshot LLC creative services, deposits, project work, cancellations, and third-party costs.",
  alternates: {
    canonical: "https://astroshotmedia.com/refund-policy",
  },
};

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Refund Policy"
      updatedAt="August 13, 2026"
      intro={`This Refund Policy explains how ${companyInfo.legalName} handles payments, cancellations, deposits, and refund requests for creative services.`}
      sections={[
        {
          title: "General Policy",
          body: [
            "Astroshot provides custom creative and production services. Because work is tailored to each client, payments are generally non-refundable once strategy, planning, production, design, editing, management, or other project work has started.",
          ],
        },
        {
          title: "Deposits And Upfront Payments",
          body: [
            "Deposits, booking payments, upfront retainers, and initial project payments reserve production capacity and cover planning, administration, staffing, and early creative work.",
            "These payments are non-refundable unless Astroshot is unable to provide the agreed service and no reasonable alternative delivery arrangement is available.",
          ],
        },
        {
          title: "Cancellations",
          body: [
            "If a client cancels a project before work begins, Astroshot may, at its discretion, issue a partial refund after deducting any administrative, planning, payment processing, vendor, or reserved-capacity costs.",
            "If a client cancels after work has started, amounts paid may be applied to completed work, committed resources, third-party costs, and cancellation costs.",
          ],
        },
        {
          title: "Monthly Retainers",
          body: [
            "Monthly retainers and social media management fees are charged for reserved team capacity, planning, management, and production time.",
            "Retainer fees are not refundable for the active billing period once the period has started. Unused scope does not automatically roll over unless agreed in writing.",
          ],
        },
        {
          title: "Third-Party Costs",
          body: [
            "Third-party costs, including media spend, talent, locations, rentals, studio fees, software, licensing, music, stock assets, and platform charges, are non-refundable once paid, booked, or committed.",
          ],
        },
        {
          title: "Revision And Approval Issues",
          body: [
            "Refunds are not issued because of subjective creative preference after work has been delivered within the approved scope.",
            "Astroshot will use the included revision process to address reasonable feedback according to the agreed scope.",
          ],
        },
        {
          title: "Refund Requests",
          body: [
            `Refund requests must be submitted in writing to ${companyInfo.email} with the client name, invoice number, project name, payment date, and reason for the request.`,
            "Approved refunds will be processed to the original payment method when possible. Processing times may depend on banks, payment providers, and currency routes.",
          ],
        },
      ]}
    />
  );
}
