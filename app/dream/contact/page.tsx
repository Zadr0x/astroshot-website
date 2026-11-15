import type { Metadata } from "next";
import DreamLegalPage from "../legal-page";
import { companyInfo } from "@/lib/company-info";

export const metadata: Metadata = {
  title: "Dream Support",
  description: "Support and contact information for the Dream iOS app.",
};

export default function DreamContactPage() {
  return (
    <DreamLegalPage eyebrow="Support" title="Contact Dream Support" updated="12 June 2026">
      <h2>Support email</h2>
      <p>
        For help with Dream, privacy requests, account/data questions, or generated video issues, email
        {` ${companyInfo.email}.`}
      </p>

      <h2>Company</h2>
      <p>
        {companyInfo.legalName}, {companyInfo.addressLines.join(", ")}. EIN {companyInfo.ein}.
      </p>

      <h2>Phone</h2>
      <p>{companyInfo.phoneDisplay}</p>
    </DreamLegalPage>
  );
}
