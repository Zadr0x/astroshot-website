"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DreamJob = {
  endpointId: string;
  requestId: string;
  statusUrl: string;
  responseUrl: string;
};

type DreamStep = "idle" | "sheet" | "prompt" | "video" | "polling" | "ready" | "error" | "recording" | "transcribing";
type DreamView = "chat" | "journal" | "gallery" | "profile";

type DreamEntry = {
  id: string;
  title: string;
  dream: string;
  prompt: string;
  analysis: DreamAnalysis | null;
  videoUrl: string;
  status?: "generating" | "ready" | "failed";
  requestId?: string;
  error?: string;
  createdAt: string;
};

type DreamAnalysis = {
  summary: string;
  mood: string;
  symbols: string[];
  themes: string[];
  insight: string;
};

type DreamSettings = {
  time: "day" | "night";
  mood: "happy" | "sad" | "scary" | "normal";
};

type Profile = {
  name: string;
  email: string;
  picture: string;
  bio: string;
};

const DREAMS_KEY = "mydreams-entries-v1";
const PROFILE_KEY = "mydreams-profile-v1";
const defaultSettings: DreamSettings = { time: "night", mood: "normal" };

const starterDreams: DreamEntry[] = [
  {
    id: "sample-blue-city",
    title: "Blue city flight",
    dream: "I was flying over a blue city",
    prompt: "",
    analysis: {
      summary: "A dream about elevation, escape, and seeing your life from a calmer distance.",
      mood: "Free, curious, slightly lonely",
      symbols: ["Flying", "Blue city", "Night"],
      themes: ["Freedom", "Perspective", "Ambition"],
      insight: "You may be looking for more space to think and a cleaner view of the next move.",
    },
    videoUrl: "",
    status: "ready",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
  },
  {
    id: "sample-ocean-room",
    title: "Ocean inside my room",
    dream: "I saw the ocean inside my room",
    prompt: "",
    analysis: {
      summary: "A private space becomes emotional and vast, suggesting hidden feelings entering daily life.",
      mood: "Deep, reflective, intimate",
      symbols: ["Ocean", "Bedroom", "Water"],
      themes: ["Emotion", "Privacy", "Change"],
      insight: "Something internal may be asking for attention instead of staying contained.",
    },
    videoUrl: "",
    status: "ready",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5" />
      <path d="m5 12 7-7 7 7" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.2-3.2" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h10" />
      <path d="M18 7h2" />
      <circle cx="16" cy="7" r="2" />
      <path d="M4 17h2" />
      <path d="M10 17h10" />
      <circle cx="8" cy="17" r="2" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 5.5A3.5 3.5 0 0 1 7.5 2H20v18H7.5A3.5 3.5 0 0 0 4 23Z" />
      <path d="M4 5.5V23" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 6.5h14v9.5H9l-4 3Z" />
      <path d="M9 10h6M9 13h4" />
    </svg>
  );
}

function GalleryIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="m7 16 3-4 3 3 2-2 2 3" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 120 120" className="h-full w-full" fill="none">
      <path
        d="M82 91.5C58.9 92.5 39.5 74 39.5 51.6c0-14.2 7.6-27.3 20.4-34.5C39.1 19.6 23 37.2 23 58.6 23 82.3 42.2 101.5 66 101.5c17 0 31.9-9.9 38.8-24.2A39.7 39.7 0 0 1 82 91.5Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M82 91.5C58.9 92.5 39.5 74 39.5 51.6c0-14.2 7.6-27.3 20.4-34.5C39.1 19.6 23 37.2 23 58.6 23 82.3 42.2 101.5 66 101.5c17 0 31.9-9.9 38.8-24.2A39.7 39.7 0 0 1 82 91.5Z"
        stroke="rgba(59,130,246,0.35)"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        filter="blur(8px)"
      />
    </svg>
  );
}

function statusText(step: DreamStep) {
  if (step === "recording") return "Recording";
  if (step === "transcribing") return "Understanding voice";
  if (step === "sheet") return "Creating character";
  if (step === "prompt") return "Writing prompt";
  if (step === "video") return "Submitting video";
  if (step === "polling") return "Rendering";
  if (step === "ready") return "Ready";
  if (step === "error") return "Needs attention";
  return "";
}

function isBusyStep(step: DreamStep) {
  return ["sheet", "prompt", "video", "polling", "transcribing"].includes(step);
}

function readDreams() {
  if (typeof window === "undefined") return starterDreams;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(DREAMS_KEY) || "null") as DreamEntry[] | null;
    return Array.isArray(parsed) ? parsed : starterDreams;
  } catch {
    return starterDreams;
  }
}

function readProfile() {
  if (typeof window === "undefined") return { name: "", email: "", picture: "", bio: "" };
  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROFILE_KEY) || "null") as Profile | null;
    return parsed || { name: "", email: "", picture: "", bio: "" };
  } catch {
    return { name: "", email: "", picture: "", bio: "" };
  }
}

function formatAge(value: string) {
  const created = new Date(value).getTime();
  const diff = Math.max(0, Date.now() - created);
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "last night";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

async function readError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null) as { error?: string } | null;
  return data?.error || fallback;
}

function titleFromDream(value: string) {
  const clean = value.trim().replace(/\s+/g, " ");
  if (!clean) return "New dream";
  return clean.length > 36 ? `${clean.slice(0, 36)}...` : clean;
}

export default function HilmProduct() {
  const [dream, setDream] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [characterSheetUrl, setCharacterSheetUrl] = useState("");
  const [seedancePrompt, setSeedancePrompt] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [job, setJob] = useState<DreamJob | null>(null);
  const [step, setStep] = useState<DreamStep>("idle");
  const [error, setError] = useState("");
  const [view, setView] = useState<DreamView>("chat");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<DreamSettings>(defaultSettings);
  const [dreams, setDreams] = useState<DreamEntry[]>(starterDreams);
  const [selectedDreamId, setSelectedDreamId] = useState("");
  const [profile, setProfile] = useState<Profile>({ name: "", email: "", picture: "", bio: "" });
  const [search, setSearch] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const audioInputRef = useRef<HTMLInputElement | null>(null);
  const profilePicRef = useRef<HTMLInputElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const canGenerate = dream.trim().length >= 8 && !["sheet", "prompt", "video", "polling", "recording", "transcribing"].includes(step);

  useEffect(() => {
    setDreams(readDreams());
    setProfile(readProfile());
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(DREAMS_KEY, JSON.stringify(dreams));
  }, [dreams]);

  useEffect(() => {
    if (typeof window !== "undefined") window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile]);

  const filteredDreams = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dreams;
    return dreams.filter((entry) => `${entry.title} ${entry.dream}`.toLowerCase().includes(query));
  }, [dreams, search]);

  const latestDream = dreams[0];
  const selectedDream = dreams.find((entry) => entry.id === selectedDreamId) || latestDream;
  const symbolCount = dreams.reduce((total, entry) => total + (entry.analysis?.symbols.length || 0), 0);
  const topMood = dreams.find((entry) => entry.analysis?.mood)?.analysis?.mood || "Quiet, curious, reflective";
  const isGenerating = isBusyStep(step);

  const chooseAttachment = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setAttachment(file);
    setAttachmentPreview(URL.createObjectURL(file));
    setCharacterSheetUrl("");
    setVideoUrl("");
    setJob(null);
  };

  const chooseProfilePicture = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    setProfile((current) => ({ ...current, picture: URL.createObjectURL(file) }));
  };

  const transcribeAudioBlob = async (audio: Blob, fileName = "dream-recording.webm") => {
    setStep("transcribing");
    const formData = new FormData();
    formData.append("audio", audio, fileName);
    const response = await fetch("/api/hilm/transcribe", { method: "POST", body: formData });
    if (!response.ok) throw new Error(await readError(response, "Could not transcribe recording"));
    const data = await response.json() as { text: string };
    setDream((current) => [current.trim(), data.text.trim()].filter(Boolean).join(" "));
    setStep("idle");
  };

  const chooseAudioFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      await transcribeAudioBlob(file, file.name || "dream-audio.webm");
    } catch (nextError) {
      setStep("error");
      setError(nextError instanceof Error ? nextError.message : "Could not understand audio");
    }
  };

  const pollVideo = async (nextJob: DreamJob) => {
    setStep("polling");
    for (let attempt = 0; attempt < 90; attempt += 1) {
      await new Promise((resolve) => window.setTimeout(resolve, attempt < 4 ? 2500 : 5000));
      const query = new URLSearchParams({
        endpointId: nextJob.endpointId,
        requestId: nextJob.requestId,
        responseUrl: nextJob.responseUrl,
        statusUrl: nextJob.statusUrl,
      });
      const response = await fetch(`/api/hilm/video/status?${query.toString()}`);
      if (!response.ok) throw new Error(await readError(response, "Could not check video status"));
      const data = await response.json() as { status?: string; videoUrl?: string };
      if (data.videoUrl) {
        setVideoUrl(data.videoUrl);
        setStep("ready");
        return data.videoUrl;
      }
      if (data.status === "FAILED") throw new Error("Seedance video generation failed");
    }
    throw new Error("Video is still rendering. Try checking again in a moment.");
  };

  const analyzeDream = async (dreamText: string) => {
    const response = await fetch("/api/hilm/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ dream: dreamText }),
    });
    if (!response.ok) throw new Error(await readError(response, "Could not analyze dream"));
    const data = await response.json() as { analysis: DreamAnalysis };
    return data.analysis;
  };

  const generateDream = async () => {
    if (!canGenerate) return;
    setError("");
    setVideoUrl("");
    setJob(null);
    const dreamText = dream.trim();
    const entryId = `dream-${Date.now()}`;

    try {
      let sheetUrl = characterSheetUrl;
      if (attachment && !sheetUrl) {
        setStep("sheet");
        const formData = new FormData();
        formData.append("selfie", attachment);
        const response = await fetch("/api/hilm/character-sheet", { method: "POST", body: formData });
        if (!response.ok) throw new Error(await readError(response, "Could not create character reference"));
        const data = await response.json() as { characterSheetUrl: string };
        sheetUrl = data.characterSheetUrl;
        setCharacterSheetUrl(sheetUrl);
      }

      setStep("prompt");
      const promptResponse = await fetch("/api/hilm/prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dream, hasSelfie: Boolean(sheetUrl), settings }),
      });
      if (!promptResponse.ok) throw new Error(await readError(promptResponse, "Could not write video prompt"));
      const promptData = await promptResponse.json() as { prompt: string };
      setSeedancePrompt(promptData.prompt);

      const [analysis] = await Promise.all([analyzeDream(dreamText)]);
      const generatingEntry: DreamEntry = {
        id: entryId,
        title: titleFromDream(dreamText),
        dream: dreamText,
        prompt: promptData.prompt,
        analysis,
        videoUrl: "",
        status: "generating",
        createdAt: new Date().toISOString(),
      };
      setDreams((current) => [generatingEntry, ...current]);
      setSelectedDreamId(entryId);

      setStep("video");
      const videoResponse = await fetch("/api/hilm/video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptData.prompt, characterSheetUrl: sheetUrl }),
      });
      if (!videoResponse.ok) throw new Error(await readError(videoResponse, "Could not start video generation"));
      const videoData = await videoResponse.json() as DreamJob;
      setJob(videoData);
      setDreams((current) => current.map((entry) => entry.id === entryId ? { ...entry, requestId: videoData.requestId } : entry));
      const finalVideoUrl = await pollVideo(videoData);
      setDreams((current) => current.map((entry) => entry.id === entryId ? { ...entry, videoUrl: finalVideoUrl, status: "ready" } : entry));
      setView("journal");
      setDream("");
      setAttachment(null);
      setAttachmentPreview("");
    } catch (nextError) {
      setDreams((current) => current.map((entry) => entry.id === entryId ? { ...entry, status: "failed", error: nextError instanceof Error ? nextError.message : "Something went wrong" } : entry));
      setStep("error");
      setError(nextError instanceof Error ? nextError.message : "Something went wrong");
    }
  };

  const toggleRecording = async () => {
    if (step === "recording") {
      mediaRecorderRef.current?.stop();
      return;
    }

    const isLocalhost = ["localhost", "127.0.0.1"].includes(window.location.hostname);
    if (!window.isSecureContext && !isLocalhost) {
      setStep("error");
      setError("Voice recording needs HTTPS. This public HTTP preview can generate video, but browser recording will work after HTTPS deployment.");
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setStep("error");
      setError("Voice recording needs HTTPS or localhost. This HTTP preview cannot access the microphone.");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        try {
          const audio = new Blob(audioChunksRef.current, { type: recorder.mimeType || "audio/webm" });
          await transcribeAudioBlob(audio);
        } catch (nextError) {
          setStep("error");
          setError(nextError instanceof Error ? nextError.message : "Could not understand recording");
        }
      };
      recorder.start();
      setStep("recording");
    } catch {
      setStep("error");
      setError("Microphone permission was blocked");
    }
  };

  const openView = (nextView: DreamView) => {
    setView(nextView);
    setMenuOpen(false);
  };

  return (
    <main className="mydreams-root min-h-screen overflow-hidden bg-[#01030a] text-white">
      <style>{`
        html:has(.mydreams-root),
        body:has(.mydreams-root),
        .mydreams-root {
          scrollbar-width: none;
        }
        html:has(.mydreams-root)::-webkit-scrollbar,
        body:has(.mydreams-root)::-webkit-scrollbar,
        .mydreams-root::-webkit-scrollbar {
          display: none;
        }
        .dream-motion-field {
          background:
            radial-gradient(circle at 12% 28%, rgba(255, 74, 178, 0.42), transparent 18%),
            radial-gradient(circle at 84% 24%, rgba(52, 226, 255, 0.36), transparent 20%),
            radial-gradient(circle at 72% 78%, rgba(159, 93, 255, 0.38), transparent 22%),
            radial-gradient(circle at 28% 74%, rgba(63, 255, 202, 0.26), transparent 20%),
            radial-gradient(circle at 50% 42%, rgba(255, 196, 86, 0.16), transparent 18%);
          filter: blur(28px) saturate(1.55);
          transform: scale(1.12);
          animation: dream-drift 8s ease-in-out infinite alternate;
        }
        .dream-ripple-field {
          background:
            repeating-radial-gradient(circle at 52% 48%, rgba(255,255,255,0.055) 0 1px, transparent 1px 22px),
            repeating-radial-gradient(circle at 24% 72%, rgba(255,120,214,0.052) 0 1px, transparent 1px 18px),
            linear-gradient(115deg, transparent, rgba(75, 113, 255, 0.075), transparent);
          mix-blend-mode: screen;
          opacity: 0.44;
          animation: dream-ripple 13s linear infinite;
        }
        .dream-noise-field {
          background-image:
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(0deg, rgba(255,255,255,0.025) 1px, transparent 1px);
          background-size: 68px 68px;
          mask-image: radial-gradient(circle at 50% 50%, black, transparent 72%);
          opacity: 0.28;
          animation: dream-grid 28s linear infinite;
        }
        .dream-aurora-field {
          background:
            conic-gradient(from 40deg at 50% 50%, rgba(255, 88, 188, 0.16), rgba(68, 210, 255, 0.2), rgba(117, 90, 255, 0.18), rgba(74, 255, 198, 0.12), rgba(255, 88, 188, 0.16)),
            radial-gradient(circle at 34% 44%, rgba(255, 129, 213, 0.22), transparent 18%),
            radial-gradient(circle at 68% 54%, rgba(77, 224, 255, 0.18), transparent 22%);
          background-size: 180% 180%, 140% 140%, 150% 150%;
          filter: blur(30px) saturate(1.45);
          opacity: 0.94;
          animation: dream-aurora 6s ease-in-out infinite alternate;
        }
        .dream-stream-field {
          background:
            radial-gradient(circle at 0% 50%, rgba(255, 83, 190, 0.28), transparent 18%),
            radial-gradient(circle at 25% 50%, rgba(53, 231, 255, 0.22), transparent 16%),
            radial-gradient(circle at 50% 50%, rgba(158, 94, 255, 0.22), transparent 18%),
            radial-gradient(circle at 75% 50%, rgba(71, 255, 193, 0.18), transparent 16%),
            radial-gradient(circle at 100% 50%, rgba(255, 205, 96, 0.16), transparent 18%);
          background-size: 165% 165%;
          filter: blur(18px) saturate(1.8);
          opacity: 0.68;
          mix-blend-mode: screen;
          animation: dream-stream 5.6s ease-in-out infinite alternate;
        }
        .dream-orb {
          position: fixed;
          z-index: 0;
          pointer-events: none;
          border-radius: 9999px;
          filter: blur(18px);
          opacity: 0.28;
          mix-blend-mode: screen;
          transform: translate3d(0, 0, 0);
        }
        .dream-orb-one {
          width: 42vw;
          height: 42vw;
          left: 2vw;
          top: 9vh;
          background: radial-gradient(circle, rgba(255, 74, 190, 0.72), transparent 62%);
          animation: dream-float-one 8s ease-in-out infinite alternate;
        }
        .dream-orb-two {
          width: 38vw;
          height: 38vw;
          right: 2vw;
          top: 13vh;
          background: radial-gradient(circle, rgba(51, 231, 255, 0.68), transparent 64%);
          animation: dream-float-two 9s ease-in-out infinite alternate;
        }
        .dream-orb-three {
          width: 46vw;
          height: 46vw;
          left: 30vw;
          bottom: -10vh;
          background: radial-gradient(circle, rgba(132, 82, 255, 0.62), transparent 66%);
          animation: dream-float-three 10s ease-in-out infinite alternate;
        }
        .dream-orb-four {
          width: 28vw;
          height: 28vw;
          right: 30vw;
          bottom: 10vh;
          background: radial-gradient(circle, rgba(67, 255, 186, 0.48), transparent 64%);
          animation: dream-float-four 7s ease-in-out infinite alternate;
        }
        @keyframes dream-drift {
          0% { transform: scale(1.12) translate3d(-8%, -5%, 0) rotate(0deg); }
          50% { transform: scale(1.22) translate3d(7%, 4%, 0) rotate(18deg); }
          100% { transform: scale(1.14) translate3d(5%, -7%, 0) rotate(38deg); }
        }
        @keyframes dream-ripple {
          0% { transform: scale(1) rotate(0deg) translate3d(-2%, 0, 0); }
          50% { transform: scale(1.12) rotate(180deg) translate3d(3%, 2%, 0); }
          100% { transform: scale(1) rotate(360deg) translate3d(-2%, 0, 0); }
        }
        @keyframes dream-grid {
          0% { background-position: 0 0; }
          100% { background-position: 68px 136px; }
        }
        @keyframes dream-aurora {
          0% { background-position: 0% 42%, 8% 22%, 82% 70%; transform: scale(1.06) translate3d(-5%, 3%, 0) rotate(0deg); }
          50% { background-position: 70% 38%, 42% 66%, 44% 30%; transform: scale(1.16) translate3d(5%, -4%, 0) rotate(12deg); }
          100% { background-position: 100% 58%, 78% 26%, 16% 76%; transform: scale(1.1) translate3d(6%, 4%, 0) rotate(24deg); }
        }
        @keyframes dream-stream {
          0% { background-position: 0% 45%; transform: translate3d(-10%, -2%, 0) rotate(-8deg) scale(1.08); }
          50% { background-position: 58% 52%; transform: translate3d(4%, 5%, 0) rotate(7deg) scale(1.16); }
          100% { background-position: 100% 48%; transform: translate3d(10%, -4%, 0) rotate(15deg) scale(1.1); }
        }
        @keyframes dream-float-one {
          0% { transform: translate3d(-8vw, -5vh, 0) scale(0.85); }
          100% { transform: translate3d(18vw, 15vh, 0) scale(1.2); }
        }
        @keyframes dream-float-two {
          0% { transform: translate3d(8vw, 3vh, 0) scale(0.9); }
          100% { transform: translate3d(-18vw, 18vh, 0) scale(1.18); }
        }
        @keyframes dream-float-three {
          0% { transform: translate3d(-10vw, 8vh, 0) scale(1); }
          100% { transform: translate3d(12vw, -18vh, 0) scale(1.16); }
        }
        @keyframes dream-float-four {
          0% { transform: translate3d(7vw, -5vh, 0) scale(0.82); }
          100% { transform: translate3d(-14vw, 10vh, 0) scale(1.24); }
        }
        .dream-writing-panel::before {
          content: "";
          position: absolute;
          inset: -1px;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 18% 28%, rgba(102, 144, 255, 0.14), transparent 24%),
            linear-gradient(110deg, transparent 0%, rgba(116, 150, 255, 0.08) 38%, transparent 62%);
          background-size: 180% 180%;
          opacity: 0.72;
          animation: dream-panel-breathe 7s ease-in-out infinite alternate;
        }
        .dream-writing-panel > * {
          position: relative;
          z-index: 1;
        }
        @keyframes dream-panel-breathe {
          0% { background-position: 0% 45%; opacity: 0.4; }
          50% { background-position: 68% 55%; opacity: 0.78; }
          100% { background-position: 100% 48%; opacity: 0.48; }
        }
      `}</style>
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(180deg,#02030a_0%,#050816_50%,#010105_100%)]" />
      <div className="dream-motion-field pointer-events-none fixed -inset-20" />
      <div className="dream-aurora-field pointer-events-none fixed -inset-24" />
      <div className="dream-stream-field pointer-events-none fixed -inset-20" />
      <div className="dream-orb dream-orb-one" />
      <div className="dream-orb dream-orb-two" />
      <div className="dream-orb dream-orb-three" />
      <div className="dream-orb dream-orb-four" />
      <div className="dream-ripple-field pointer-events-none fixed -inset-12" />
      <div className="dream-noise-field pointer-events-none fixed inset-0" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_52%,transparent_0%,rgba(0,0,0,0.22)_44%,rgba(0,0,0,0.82)_100%)]" />

      <section className="relative mx-auto flex min-h-screen w-full max-w-[1180px] flex-col px-4 pb-5 pt-5 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between lg:h-20">
          <button type="button" onClick={() => setMenuOpen(true)} className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/[0.035] text-white/82 shadow-[0_12px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl" aria-label="Open menu">
            <MenuIcon />
          </button>
          {step !== "idle" && <div className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-semibold text-white/38">{statusText(step)}</div>}
        </header>

        {view === "chat" && (
          <div className="flex flex-1 flex-col items-center justify-center pb-10 pt-8 text-center lg:min-h-[calc(100vh-8rem)] lg:pb-20 lg:pt-0">
            {isGenerating ? (
              <div className="w-full max-w-[420px] rounded-[30px] border border-[#2f7dff]/25 bg-[#07101f]/72 p-7 shadow-[0_30px_90px_rgba(0,0,0,0.45)] backdrop-blur-2xl lg:max-w-[520px]">
                <div className="mx-auto h-20 w-20 animate-pulse rounded-full bg-[radial-gradient(circle,rgba(121,156,255,0.84),rgba(39,88,255,0.18)_48%,transparent_70%)] shadow-[0_0_42px_rgba(80,120,255,0.55)]" />
                <h1 className="mt-6 font-serif text-3xl text-white lg:text-5xl">Your dream is being generated</h1>
                <p className="mt-3 text-sm leading-6 text-white/46">{statusText(step)}...</p>
                <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/8">
                  <div className="h-full w-2/3 animate-pulse rounded-full bg-[#246bff]" />
                </div>
                {job?.requestId && <p className="mt-4 truncate text-xs text-white/24">Job {job.requestId}</p>}
              </div>
            ) : videoUrl ? (
              <div className="w-full max-w-[420px] lg:max-w-[980px]">
                <video src={videoUrl} controls playsInline className="aspect-video w-full rounded-[28px] border border-white/10 bg-black object-cover shadow-[0_30px_90px_rgba(0,0,0,0.55)]" />
              </div>
            ) : (
              <>
                {(attachmentPreview || characterSheetUrl) && (
                  <div className="mt-7 flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">
                    {attachmentPreview && <img src={attachmentPreview} alt="" className="h-9 w-9 rounded-full object-cover" />}
                    {characterSheetUrl && <img src={characterSheetUrl} alt="" className="h-9 w-9 rounded-full object-cover" />}
                    <span className="max-w-[220px] truncate text-xs font-semibold text-white/48">{characterSheetUrl ? "Reference ready" : attachment ? attachment.name : ""}</span>
                  </div>
                )}
                {(seedancePrompt || job) && (
                  <div className="mt-4 max-w-[340px] rounded-full border border-[#2f7dff]/20 bg-[#2f7dff]/8 px-4 py-2 text-xs font-semibold text-[#8bbdff]/76">
                    {job && !videoUrl ? `Rendering job ${job.requestId}` : "Prompt ready"}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {view === "journal" && (
          <section className="pb-32 pt-10">
            {selectedDreamId && selectedDream ? (
              <>
                <button type="button" onClick={() => setSelectedDreamId("")} className="mb-5 rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/54">Back to journal</button>
                <h1 className="font-serif text-4xl leading-tight text-white">{selectedDream.title}</h1>
                <p className="mt-2 text-sm text-white/30">{formatAge(selectedDream.createdAt)}</p>
                <div className="mt-5 overflow-hidden rounded-[24px] border border-white/10 bg-[#050916]/82">
                  {selectedDream.videoUrl ? (
                    <video src={selectedDream.videoUrl} controls playsInline className="aspect-video w-full bg-black object-cover" />
                  ) : (
                    <div className="flex aspect-video flex-col items-center justify-center gap-3 bg-[radial-gradient(circle,rgba(36,107,255,0.24),transparent_50%),#030711] text-center text-[#8bbdff]">
                      <div className="h-14 w-14 animate-pulse text-[#66a6ff]"><MoonIcon /></div>
                      <p className="text-sm font-semibold">{selectedDream.status === "failed" ? "Video failed" : "Video is being generated"}</p>
                    </div>
                  )}
                </div>
                <div className="mt-5 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#73a9ff]">Interpretation</p>
                  <p className="mt-3 text-base leading-7 text-white/64">{selectedDream.analysis?.summary || selectedDream.dream}</p>
                  <p className="mt-4 text-lg font-semibold text-white">{selectedDream.analysis?.mood || "Reflective"}</p>
                  <p className="mt-2 text-sm leading-6 text-white/44">{selectedDream.analysis?.insight || "Analysis will appear here after the dream is processed."}</p>
                  {selectedDream.analysis && (
                    <div className="mt-5 space-y-4">
                      <div>
                        <p className="text-xs font-semibold text-white/32">Symbols</p>
                        <div className="mt-2 flex flex-wrap gap-2">{selectedDream.analysis.symbols.map((symbol) => <span key={symbol} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/54">{symbol}</span>)}</div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white/32">Themes</p>
                        <div className="mt-2 flex flex-wrap gap-2">{selectedDream.analysis.themes.map((theme) => <span key={theme} className="rounded-full border border-[#2f7dff]/25 bg-[#2f7dff]/8 px-3 py-1 text-xs text-[#8bbdff]">{theme}</span>)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <h1 className="font-serif text-4xl text-white">Journal</h1>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[22px] border border-[#2f7dff]/20 bg-[#07101f]/72 p-4">
                    <p className="text-xs font-semibold text-white/36">Dreams</p>
                    <p className="mt-2 text-3xl font-black text-white">{dreams.length}</p>
                  </div>
                  <div className="rounded-[22px] border border-[#2f7dff]/20 bg-[#07101f]/72 p-4">
                    <p className="text-xs font-semibold text-white/36">Symbols</p>
                    <p className="mt-2 text-3xl font-black text-white">{symbolCount}</p>
                  </div>
                </div>
                <div className="mt-3 rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#73a9ff]">Current pattern</p>
                  <p className="mt-3 text-lg font-semibold leading-7 text-white">{topMood}</p>
                  <p className="mt-2 text-sm leading-6 text-white/44">{latestDream?.analysis?.insight || "Write a dream to unlock a simple pattern analysis."}</p>
                </div>
                <div className="mt-5 space-y-3">
                  {dreams.map((entry) => (
                    <button type="button" key={entry.id} onClick={() => setSelectedDreamId(entry.id)} className="block w-full rounded-[24px] border border-white/10 bg-[#050916]/82 p-4 text-left">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h2 className="font-serif text-2xl text-white">{entry.title}</h2>
                          <p className="mt-1 text-xs text-white/30">{formatAge(entry.createdAt)}</p>
                        </div>
                        <span className="rounded-full bg-[#246bff]/14 px-3 py-1 text-xs font-bold text-[#8bbdff]">{entry.status === "generating" ? "Generating" : entry.analysis?.themes[0] || "Dream"}</span>
                      </div>
                      <p className="mt-4 text-sm leading-6 text-white/54">{entry.analysis?.summary || entry.dream}</p>
                      {entry.analysis && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {entry.analysis.symbols.map((symbol) => <span key={symbol} className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/44">{symbol}</span>)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        {view === "gallery" && (
          <section className="pb-32 pt-10">
            <h1 className="font-serif text-4xl text-white">Gallery</h1>
            <div className="mt-5 grid grid-cols-2 gap-3">
              {dreams.map((entry) => (
                <button type="button" key={entry.id} onClick={() => { setSelectedDreamId(entry.id); setView("journal"); }} className="min-h-52 rounded-[24px] border border-white/10 bg-[#07101f]/72 p-3 text-left">
                  {entry.videoUrl ? (
                    <video src={entry.videoUrl} className="aspect-video w-full rounded-[16px] bg-black object-cover" />
                  ) : (
                    <div className="flex aspect-video items-center justify-center rounded-[16px] bg-[radial-gradient(circle,rgba(36,107,255,0.28),transparent_46%),#030711] text-[#66a6ff]">
                      <MoonIcon />
                    </div>
                  )}
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <h2 className="truncate font-serif text-lg text-white">{entry.title}</h2>
                    {entry.status === "generating" && <span className="rounded-full bg-[#246bff]/14 px-2 py-1 text-[10px] font-bold text-[#8bbdff]">Rendering</span>}
                  </div>
                  <p className="text-xs text-white/30">{formatAge(entry.createdAt)}</p>
                </button>
              ))}
            </div>
          </section>
        )}

        {view === "profile" && (
          <section className="pb-32 pt-10">
            <h1 className="font-serif text-4xl text-white">Profile</h1>
            <div className="mt-6 rounded-[28px] border border-white/10 bg-[#07101f]/82 p-5">
              <input ref={profilePicRef} type="file" accept="image/*" className="hidden" onChange={(event) => chooseProfilePicture(event.target.files?.[0])} />
              <button type="button" onClick={() => profilePicRef.current?.click()} className="mx-auto flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-[#2f7dff]/35 bg-[#2f7dff]/10 text-3xl font-serif text-white shadow-[0_0_32px_rgba(47,125,255,0.22)]">
                {profile.picture ? <img src={profile.picture} alt="" className="h-full w-full object-cover" /> : (profile.name.trim()[0] || "A")}
              </button>
              <div className="mt-5 space-y-3">
                <input value={profile.name} onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))} placeholder="Name" className="h-12 w-full rounded-[16px] border border-white/10 bg-black/18 px-4 text-white outline-none placeholder:text-white/28" />
                <input value={profile.email} onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))} placeholder="Email" className="h-12 w-full rounded-[16px] border border-white/10 bg-black/18 px-4 text-white outline-none placeholder:text-white/28" />
                <textarea value={profile.bio} onChange={(event) => setProfile((current) => ({ ...current, bio: event.target.value }))} placeholder="Basic information" className="min-h-28 w-full resize-none rounded-[16px] border border-white/10 bg-black/18 p-4 text-white outline-none placeholder:text-white/28" />
              </div>
            </div>
          </section>
        )}

        {error && <div className="mb-3 rounded-[18px] border border-red-400/25 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-100">{error}</div>}

        {view === "chat" && (
          <div className="fixed inset-x-0 top-1/2 z-10 mx-auto max-w-[460px] -translate-y-1/2 px-4 sm:max-w-[640px] lg:max-w-[860px]">
            <div className="dream-writing-panel relative overflow-hidden rounded-[38px] border border-white/14 bg-[#070b18]/76 p-4 shadow-[0_28px_110px_rgba(0,0,0,0.68),0_0_70px_rgba(64,100,255,0.16)] backdrop-blur-2xl transition focus-within:border-[#6f9cff]/42 focus-within:bg-[#080d1d]/86">
              {settingsOpen && (
                <div className="mb-3 rounded-[24px] border border-[#2f7dff]/20 bg-[#050916]/92 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-white">Video settings</p>
                    <button type="button" onClick={() => setSettingsOpen(false)} className="text-sm font-semibold text-white/34">Done</button>
                  </div>
                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/32">Time</p>
                      <div className="grid grid-cols-2 gap-2">
                        {(["day", "night"] as const).map((time) => (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSettings((current) => ({ ...current, time }))}
                            className={`h-10 rounded-full border text-sm font-semibold capitalize ${settings.time === time ? "border-[#2f7dff]/70 bg-[#246bff]/22 text-white" : "border-white/10 bg-white/[0.03] text-white/46"}`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/32">Mood</p>
                      <div className="grid grid-cols-4 gap-2">
                        {(["happy", "sad", "scary", "normal"] as const).map((mood) => (
                          <button
                            key={mood}
                            type="button"
                            onClick={() => setSettings((current) => ({ ...current, mood }))}
                            className={`h-10 rounded-full border text-xs font-semibold capitalize ${settings.mood === mood ? "border-[#2f7dff]/70 bg-[#246bff]/22 text-white" : "border-white/10 bg-white/[0.03] text-white/46"}`}
                          >
                            {mood}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button type="button" onClick={() => inputRef.current?.click()} className="flex h-11 w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] text-sm font-semibold text-white/64">
                      <PlusIcon /> Upload your image
                    </button>
                  </div>
                </div>
              )}
              {attachmentPreview && (
                <div className="mb-3 flex items-center gap-3 rounded-[18px] border border-white/10 bg-black/18 p-2">
                  <img src={attachmentPreview} alt="" className="h-14 w-14 rounded-[14px] object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-white/70">{attachment?.name || "Image attached"}</p>
                    <p className="text-xs text-white/28">Attached to this dream</p>
                  </div>
                  <button type="button" onClick={() => { setAttachment(null); setAttachmentPreview(""); setCharacterSheetUrl(""); }} className="flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/54" aria-label="Remove attachment">×</button>
                </div>
              )}
              <textarea value={dream} onChange={(event) => setDream(event.target.value)} placeholder="Start with anything you remember..." rows={3} className="mb-4 max-h-52 min-h-28 w-full resize-none bg-transparent px-4 pt-2 text-[22px] font-medium leading-8 text-white outline-none placeholder:text-white/42 sm:min-h-32 sm:text-[24px] sm:leading-9 lg:min-h-36 lg:px-5 lg:text-[26px] lg:leading-10" />
              {!dream.trim() && (
                <div className="mb-4 flex flex-wrap gap-2 px-1">
                  {["I was somewhere strange", "Someone appeared", "I felt something"].map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => setDream(prompt)}
                      className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-2 text-xs font-semibold text-white/42 transition hover:border-[#6f9cff]/35 hover:bg-[#2f7dff]/10 hover:text-white/70"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex items-center gap-3 border-t border-white/8 pt-3">
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(event) => chooseAttachment(event.target.files?.[0])} />
                <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={(event) => chooseAudioFile(event.target.files?.[0])} />
                <button type="button" onClick={() => inputRef.current?.click()} className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black/18 text-white transition hover:border-[#2f7dff]/55 hover:text-[#8bbdff]" aria-label="Attach image">
                  <PlusIcon />
                </button>
                <button type="button" onClick={() => setSettingsOpen((open) => !open)} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition ${settingsOpen ? "border-[#2f7dff]/55 bg-[#246bff]/16 text-[#8bbdff]" : "border-white/10 bg-black/18 text-white/86"}`} aria-label="Video settings">
                  <SettingsIcon />
                </button>
                <div className="hidden min-w-0 flex-1 sm:block">
                  <p className="truncate text-xs font-semibold text-white/30">{attachment ? "Image attached" : `${settings.time} · ${settings.mood}`}</p>
                </div>
                <button type="button" onClick={toggleRecording} className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full border text-white/86 ${step === "recording" ? "border-red-300/40 bg-red-500/20" : "border-white/10 bg-black/18"}`} aria-label="Record voice">
                  <MicIcon />
                </button>
              </div>
              <button type="button" disabled={!canGenerate} onClick={generateDream} className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-[linear-gradient(110deg,#ff4ab2,#7c5cff,#35dfff,#42ffc7,#ff4ab2)] bg-[length:240%_240%] text-sm font-black text-white shadow-[0_0_38px_rgba(112,132,255,0.42)] transition hover:scale-[1.01] hover:shadow-[0_0_52px_rgba(112,132,255,0.58)] disabled:cursor-not-allowed disabled:opacity-55 disabled:saturate-50 sm:text-base" aria-label="See your dream">
                See your dream
                <SendIcon />
              </button>
            </div>
          </div>
        )}

        {menuOpen && (
          <div className="fixed inset-0 z-30 bg-black/35 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
            <aside className="absolute right-0 top-0 flex h-full w-[82%] max-w-[350px] flex-col border-l border-[#2f7dff]/18 bg-[#050815]/96 px-6 py-8 shadow-[-30px_0_80px_rgba(0,0,0,0.55)]" onClick={(event) => event.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-[38px] leading-none text-white">
                  Mydreams
                  <span className="ml-1 align-top text-sm text-[#2f7dff]">✦</span>
                </h2>
                <button type="button" aria-label="Open profile" onClick={() => openView("profile")} className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border border-[#2f7dff]/30 bg-[#07101f] font-serif text-2xl shadow-[0_0_30px_rgba(47,125,255,0.22)]">
                  {profile.picture ? <img src={profile.picture} alt="" className="h-full w-full object-cover" /> : (profile.name.trim()[0] || "A")}
                </button>
              </div>

              <nav className="mt-10 space-y-3">
                <button type="button" onClick={() => openView("chat")} className={`flex h-16 w-full items-center gap-4 rounded-[18px] border px-5 text-left text-xl ${view === "chat" ? "border-[#2f7dff]/55 bg-[#2f7dff]/8 text-white shadow-[0_0_24px_rgba(47,125,255,0.18)]" : "border-transparent text-white/72"}`}>
                  <ChatIcon /> Chats
                </button>
                <button type="button" onClick={() => openView("journal")} className={`flex h-16 w-full items-center gap-4 rounded-[18px] border px-5 text-left text-xl ${view === "journal" ? "border-[#2f7dff]/55 bg-[#2f7dff]/8 text-white shadow-[0_0_24px_rgba(47,125,255,0.18)]" : "border-transparent text-white/72"}`}>
                  <BookIcon /> Journal
                </button>
                <button type="button" onClick={() => openView("gallery")} className={`flex h-16 w-full items-center gap-4 rounded-[18px] border px-5 text-left text-xl ${view === "gallery" ? "border-[#2f7dff]/55 bg-[#2f7dff]/8 text-white shadow-[0_0_24px_rgba(47,125,255,0.18)]" : "border-transparent text-white/72"}`}>
                  <GalleryIcon /> Gallery
                </button>
              </nav>

              <div className="mt-12 min-h-0 flex-1 overflow-auto">
                <div className="space-y-6">
                  {filteredDreams.slice(0, 6).map((entry) => (
                    <button key={entry.id} type="button" onClick={() => { setSelectedDreamId(entry.id); setView("journal"); setMenuOpen(false); }} className="block w-full border-b border-white/8 pb-5 text-left">
                      <p className="font-serif text-xl leading-7 text-white">{entry.title}</p>
                      <p className="mt-1 text-sm text-white/22">{entry.status === "generating" ? "generating now" : formatAge(entry.createdAt)}</p>
                    </button>
                  ))}
                </div>
              </div>

              <label className="mt-5 flex h-14 items-center gap-3 rounded-full border border-white/10 bg-black/20 px-5 text-white/32">
                <SearchIcon />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search" className="min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/28" />
              </label>
            </aside>
          </div>
        )}
      </section>
    </main>
  );
}
