import type { Metadata } from "next";
import DreamLegalPage from "../legal-page";

export const metadata: Metadata = {
  title: "Dream Privacy Policy",
  description: "Privacy policy for the Dream iOS app.",
};

export default function DreamPrivacyPage() {
  return (
    <DreamLegalPage eyebrow="Privacy" title="Privacy Policy" updated="12 June 2026">
      <h2>What Dream does</h2>
      <p>
        Dream lets you write or record a dream, optionally add an image reference, and generate a cinematic dream video.
      </p>

      <h2>Information we process</h2>
      <p>
        When you use Dream, we may process the dream text you enter, voice recordings you choose to submit for transcription,
        image references you choose to upload, generated prompts, video render job information, generated video links, and
        basic technical data needed to operate and secure the service.
      </p>

      <h2>How we use information</h2>
      <p>
        We use this information to transcribe your recording, create a prompt, generate your dream video, show generation
        status, troubleshoot errors, protect the service, and improve reliability.
      </p>

      <h2>Third-party processing</h2>
      <p>
        Dream may use infrastructure, AI generation, transcription, storage, and video rendering providers to deliver the
        service. These providers process submitted content only as needed to provide their services to us.
      </p>

      <h2>Retention and deletion</h2>
      <p>
        Dream stores your local dream history on your device. Generated assets and server logs may be retained for service
        operation, support, security, and debugging. To request deletion of submitted content or related data, contact us at
        info@astroshotpm.com.
      </p>

      <h2>Contact</h2>
      <p>
        For privacy requests, contact Astroshot Project Management Company at info@astroshotpm.com.
      </p>
    </DreamLegalPage>
  );
}

