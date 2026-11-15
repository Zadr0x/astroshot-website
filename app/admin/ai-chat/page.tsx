"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AiAppBottomNav from "@/components/admin/AiAppBottomNav";
import { supabase } from "@/lib/supabase";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatSession = {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
};

const STORAGE_KEY = "astroshot-ai-chat-history";

function sessionTitle(messages: ChatMessage[]) {
  const firstUser = messages.find((message) => message.role === "user")?.content.trim();
  return firstUser ? firstUser.slice(0, 48) : "New chat";
}

function readSessions(): ChatSession[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]") as ChatSession[];
    return Array.isArray(parsed) ? parsed.filter((item) => Array.isArray(item.messages)) : [];
  } catch {
    return [];
  }
}

export default function AiChatPage() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState(() => `chat-${Date.now()}`);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const hasConversation = messages.length > 0;
  const visibleMessages = useMemo(() => messages.slice(-10), [messages]);

  useEffect(() => {
    setSessions(readSessions());
  }, []);

  useEffect(() => {
    if (messages.length === 0) return;
    const nextSession: ChatSession = {
      id: sessionId,
      title: sessionTitle(messages),
      updatedAt: new Date().toISOString(),
      messages,
    };
    const nextSessions = [nextSession, ...sessions.filter((item) => item.id !== sessionId)].slice(0, 20);
    setSessions(nextSessions);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, sessionId]);

  const startNewChat = () => {
    setSessionId(`chat-${Date.now()}`);
    setMessages([]);
    setInput("");
    setError("");
    setHistoryOpen(false);
  };

  const openSession = (session: ChatSession) => {
    setSessionId(session.id);
    setMessages(session.messages);
    setInput("");
    setError("");
    setHistoryOpen(false);
  };

  const deleteSession = (id: string) => {
    const nextSessions = sessions.filter((session) => session.id !== id);
    setSessions(nextSessions);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSessions));
    if (id === sessionId) startNewChat();
  };

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || sending) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push("/admin/login");
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setSending(true);
    setError("");

    const res = await fetch("/api/admin/ai-chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: nextMessages }),
    });

    setSending(false);

    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      setError(data.error ?? "Could not send message.");
      return;
    }

    const data = (await res.json()) as { reply: string };
    setMessages((current) => [...current, { role: "assistant", content: data.reply }]);
  };

  return (
    <main className="min-h-screen overflow-hidden bg-black pb-24 text-white">
      <div className="pointer-events-none fixed inset-x-0 bottom-0 h-[48dvh] bg-[radial-gradient(circle_at_50%_100%,rgba(1,241,124,0.16),transparent_38%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-3xl flex-col px-4 py-4 sm:px-8">
        <header className="relative mb-7 flex items-center justify-center pt-1">
          <Link href="/admin/ai-menu" className="absolute left-0 flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-white/[0.05]">
            <img src="/astroshot-icon-green.png" alt="" className="h-6 w-6 object-contain" />
          </Link>
          <Link href="/admin/ai-menu" className="text-xl font-black tracking-[-0.04em] text-white">
            ASTRO<span className="text-[#01F17C]">SHOT</span>
          </Link>
          <div className="absolute right-0 flex gap-2">
            <button
              type="button"
              onClick={() => setHistoryOpen((open) => !open)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/82"
              aria-label="Chat history"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M3 12a9 9 0 1 0 3-6.7" />
                <path d="M3 5v5h5" />
                <path d="M12 7v5l3 2" />
              </svg>
            </button>
            <button
              type="button"
              onClick={startNewChat}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-2xl text-white/82"
              aria-label="New chat"
            >
              +
            </button>
          </div>
        </header>

        {historyOpen && (
          <section className="mb-5 rounded-[24px] border border-white/10 bg-white/[0.06] p-3 backdrop-blur-xl">
            <div className="mb-2 flex items-center justify-between px-1">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#01F17C]">History</p>
              <span className="text-xs font-medium text-white/35">{sessions.length} chats</span>
            </div>
            {sessions.length === 0 ? (
              <p className="rounded-2xl bg-black/20 p-4 text-sm text-white/40">No saved chats yet.</p>
            ) : (
              <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-2 rounded-2xl bg-black/24 p-2">
                    <button type="button" onClick={() => openSession(session)} className="min-w-0 flex-1 text-left">
                      <p className="truncate text-sm font-semibold text-white">{session.title}</p>
                      <p className="mt-0.5 text-xs text-white/35">{new Date(session.updatedAt).toLocaleString()}</p>
                    </button>
                    <button type="button" onClick={() => deleteSession(session.id)} className="flex h-8 w-8 items-center justify-center rounded-full text-white/35 hover:bg-white/10 hover:text-white" aria-label="Delete chat">×</button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        <section className={`flex-1 ${hasConversation ? "pt-0" : "pt-16"} transition-all`}>
          {!hasConversation ? (
            <div className="text-center">
              <h1 className="text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">AI Assistant</h1>
              <p className="mx-auto mt-5 max-w-xl text-base font-medium leading-7 text-white/45">
                Ask for campaign ideas, prompt help, captions, scripts, shot lists, or client strategy.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {visibleMessages.map((message, index) => (
                <div key={`${message.role}-${index}`} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[86%] whitespace-pre-wrap rounded-[22px] px-4 py-3 text-sm leading-6 ${
                    message.role === "user"
                      ? "bg-[#01F17C] text-black"
                      : "border border-white/10 bg-white/[0.06] text-white/82"
                  }`}>
                    {message.content}
                  </div>
                </div>
              ))}
              {sending && <div className="w-fit rounded-[22px] border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-white/45">Thinking...</div>}
            </div>
          )}
        </section>

        <section className="relative mt-8">
          <div className="rounded-[28px] border border-white/10 bg-black/55 p-4 shadow-[0_22px_80px_rgba(0,0,0,0.55)] backdrop-blur-xl">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask me anything..."
              className="min-h-[118px] w-full resize-none bg-transparent text-xl font-medium leading-snug text-white outline-none placeholder:text-white/35"
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  sendMessage();
                }
              }}
            />

            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-white/35">Enter to send. Shift + Enter for a new line.</p>
              <button
                type="button"
                onClick={sendMessage}
                disabled={!input.trim() || sending}
                className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#01F17C]/45 bg-[#01F17C]/10 text-xl text-[#01F17C] transition-colors hover:bg-[#01F17C] hover:text-black disabled:opacity-35"
                aria-label="Send message"
              >
                ↑
              </button>
            </div>
          </div>

          {error && <p className="mt-3 rounded-2xl border border-red-500/25 bg-red-500/10 p-3 text-sm font-semibold text-red-200">{error}</p>}
        </section>
      </div>

      <AiAppBottomNav />
    </main>
  );
}
