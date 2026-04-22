"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";

export default function AdminSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [authSaving, setAuthSaving] = useState(false);
  const [authMsg, setAuthMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push("/admin/login"); return; }
      setEmail(session.user.email ?? "");
    });
  }, [router]);

  const handleAuthUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      setAuthMsg({ type: "error", text: "Passwords don't match." });
      return;
    }
    setAuthSaving(true);
    setAuthMsg(null);

    const updates: { email?: string; password?: string } = {};
    const currentEmail = (await supabase.auth.getUser()).data.user?.email;
    if (email !== currentEmail) updates.email = email;
    if (newPassword) updates.password = newPassword;

    if (Object.keys(updates).length === 0) {
      setAuthMsg({ type: "error", text: "No changes to save." });
      setAuthSaving(false);
      return;
    }

    const { error } = await supabase.auth.updateUser(updates);
    if (error) {
      setAuthMsg({ type: "error", text: error.message });
    } else {
      setAuthMsg({ type: "success", text: "Credentials updated successfully." });
      setNewPassword("");
      setConfirmPassword("");
    }
    setAuthSaving(false);
  };

  const inputCls = "w-full px-4 py-3 rounded-xl bg-[#1a1a1a] border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-[#01F17C] transition-colors";
  const labelCls = "block text-xs font-semibold uppercase tracking-widest text-[#666] mb-2";

  return (
    <div className="p-6 lg:p-10 max-w-2xl">
      <AdminHeader title="Settings" />

      {/* Admin credentials */}
      <div className="rounded-2xl bg-[#111] border border-white/10 p-6 mb-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666] mb-6">Admin Credentials</h2>
        <form onSubmit={handleAuthUpdate} className="space-y-5">
          <div>
            <label className={labelCls}>Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label className={labelCls}>New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Leave blank to keep current"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat new password"
              className={inputCls}
            />
          </div>
          {authMsg && (
            <p className={`text-sm ${authMsg.type === "success" ? "text-[#01F17C]" : "text-red-400"}`}>
              {authMsg.text}
            </p>
          )}
          <button
            type="submit"
            disabled={authSaving}
            className="px-6 py-3 rounded-xl bg-[#01F17C] text-[#050505] text-sm font-bold hover:bg-[#00d96e] disabled:opacity-50 transition-colors"
          >
            {authSaving ? "Saving..." : "Update Credentials →"}
          </button>
        </form>
      </div>

      {/* Info */}
      <div className="rounded-2xl bg-[#111] border border-white/10 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-[#666] mb-4">Site Settings</h2>
        <p className="text-sm text-[#555] leading-relaxed">
          To edit site-wide text (contact email, phone, Instagram, footer tagline), go to{" "}
          <a href="/admin/content" className="text-[#01F17C] hover:underline">Site Content</a>.
        </p>
        <div className="mt-4 space-y-2 text-xs text-[#444]">
          <p>Supabase Project: <span className="text-[#666] font-mono">{process.env.NEXT_PUBLIC_SUPABASE_URL?.replace("https://", "").split(".")[0]}</span></p>
        </div>
      </div>
    </div>
  );
}
