import type { Metadata } from "next";
import DreamLegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Dream Terms",
  description: "Terms and conditions for the Dream iOS app.",
};

export default function DreamTermsPage() {
  return (
    <DreamLegalPage eyebrow="Terms" title="Terms & Conditions" updated="12 June 2026">
      <h2>Use of Dream</h2>
      <p>
        Dream is an AI-assisted creative tool for turning user-submitted dream descriptions and optional references into
        generated video concepts. Use the app only for lawful, respectful, and personal creative purposes.
      </p>

      <h2>User content</h2>
      <p>
        You are responsible for the text, audio, images, and other content you submit. Do not upload content that infringes
        rights, violates privacy, or includes illegal or harmful material.
      </p>

      <h2>Generated output</h2>
      <p>
        AI-generated results can be unpredictable and may contain errors or unexpected elements. Dream does not guarantee
        that generated videos will match your description exactly.
      </p>

      <h2>Availability</h2>
      <p>
        Dream depends on network services and third-party AI processing. The service may be unavailable, delayed, or changed
        without notice.
      </p>

      <h2>Contact</h2>
      <p>
        For support or terms questions, contact Astroshot Project Management Company at info@astroshotpm.com.
      </p>
    </DreamLegalPage>
  );
}

