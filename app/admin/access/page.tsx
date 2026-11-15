"use client";

export const dynamic = "force-dynamic";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import { roleLabels, type ClientPortalAccount, type TeamAccount, type TeamRole } from "@/lib/access-control";
import type { QuestionnaireType } from "@/lib/client-questionnaire";

type AccessData = {
  team: TeamAccount[];
  clients: Omit<ClientPortalAccount, "passwordHash">[];
};

type AccessTab = "team" | "clients";

const inputCls = "h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-sm text-white outline-none placeholder:text-white/25 transition-colors focus:border-white/25";
const labelCls = "mb-1.5 block text-[12px] font-medium text-white/45";

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return session ? { Authorization: `Bearer ${session.access_token}` } : {};
}

export default function AdminAccessPage() {
  const [data, setData] = useState<AccessData>({ team: [], clients: [] });
  const [activeTab, setActiveTab] = useState<AccessTab>("team");
  const [formOpen, setFormOpen] = useState(false);
  const [teamForm, setTeamForm] = useState({ name: "", email: "", password: "", role: "account_manager" as TeamRole });
  const [clientForm, setClientForm] = useState({ clientName: "", username: "", password: "", questionnaireType: "standard" as QuestionnaireType });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    const res = await fetch("/api/admin/access/accounts", { headers: await authHeaders() });
    if (!res.ok) return;
    setData(await res.json());
  };

  const createTeam = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/access/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ type: "team", ...teamForm }),
    });

    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: body.error ?? "Could not create team account" });
      return;
    }

    setTeamForm({ name: "", email: "", password: "", role: "account_manager" });
    setMessage({ type: "success", text: "Team account created." });
    setFormOpen(false);
    loadAccounts();
  };

  const createClient = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/access/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await authHeaders()) },
      body: JSON.stringify({ type: "client", ...clientForm }),
    });

    const body = await res.json().catch(() => ({}));
    setSaving(false);

    if (!res.ok) {
      setMessage({ type: "error", text: body.error ?? "Could not create client account" });
      return;
    }

    setClientForm({ clientName: "", username: "", password: "", questionnaireType: "standard" });
    setMessage({ type: "success", text: "Client account created." });
    setFormOpen(false);
    loadAccounts();
  };

  const stats = useMemo(() => ({
    team: data.team.length,
    clients: data.clients.length,
    admins: data.team.filter((account) => account.role === "admin").length,
  }), [data]);

  return (
    <div className="p-5 lg:p-8">
      <AdminHeader
        title="Access"
        actions={
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="rounded-lg bg-[#01F17C] px-3.5 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#00d96e]"
          >
            Add account
          </button>
        }
      />

      {message && (
        <p className={`mb-5 rounded-xl border px-4 py-3 text-sm ${message.type === "success" ? "border-[#01F17C]/20 bg-[#01F17C]/10 text-[#01F17C]" : "border-red-500/20 bg-red-500/10 text-red-300"}`}>
          {message.text}
        </p>
      )}

      <div className="mb-5 grid gap-3 md:grid-cols-3">
        <StatCard label="Team" value={`${stats.team} active`} />
        <StatCard label="Client Portal" value={`${stats.clients} active`} />
        <StatCard label="Admins" value={`${stats.admins} full access`} />
      </div>

      <section className="overflow-hidden rounded-xl border border-white/10 bg-white/[0.02]">
        <div className="flex border-b border-white/10 px-3 pt-3">
          <button
            type="button"
            onClick={() => setActiveTab("team")}
            className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${activeTab === "team" ? "border-[#01F17C] text-white" : "border-transparent text-white/45 hover:text-white"}`}
          >
            Team
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("clients")}
            className={`border-b-2 px-3 pb-3 text-sm font-medium transition-colors ${activeTab === "clients" ? "border-[#01F17C] text-white" : "border-transparent text-white/45 hover:text-white"}`}
          >
            Client Portal
          </button>
        </div>

        <div className="divide-y divide-white/10">
          {activeTab === "team" && data.team.map((account) => (
            <div key={account.id} className="grid gap-3 px-4 py-3 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-white">{account.name}</p>
                <p className="mt-0.5 text-sm text-white/38">{account.email}</p>
              </div>
              <p className="text-sm text-white/50">{account.permissions.canManageSettings ? "Full access" : account.permissions.canManageAccess ? "Team access + workflow" : account.permissions.canManageContentCalendar ? "Questionnaires + calendars" : "Website content"}</p>
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/60">{roleLabels[account.role]}</span>
              <button type="button" className="w-fit rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/45">Manage</button>
            </div>
          ))}

          {activeTab === "clients" && data.clients.map((account) => (
            <div key={account.username} className="grid gap-3 px-4 py-3 md:grid-cols-[1.2fr_1fr_auto_auto] md:items-center">
              <div>
                <p className="text-sm font-medium text-white">{account.clientName}</p>
                <p className="mt-0.5 text-sm text-white/38">{account.username}</p>
              </div>
              <p className="text-sm text-white/50">
                {account.questionnaireType === "brand"
                  ? "Brand questionnaire"
                  : account.questionnaireType === "explanatory_animation"
                    ? "Explainer animation questionnaire"
                    : account.questionnaireType === "media_buying_clinic"
                      ? "Media buying clinics questionnaire"
                      : "Standard questionnaire"}
              </p>
              <span className="w-fit rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-white/60">Client</span>
              <button type="button" className="w-fit rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-medium text-white/45">Manage</button>
            </div>
          ))}
        </div>
      </section>

      {formOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <button type="button" aria-label="Close" className="absolute inset-0 cursor-default" onClick={() => setFormOpen(false)} />
          <aside className="relative h-full w-full max-w-md overflow-y-auto border-l border-white/10 bg-[#101010] p-5 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#01F17C]">Access</p>
                <h2 className="mt-1 text-xl font-semibold text-white">Add account</h2>
              </div>
              <button type="button" title="Close" aria-label="Close" onClick={() => setFormOpen(false)} className="rounded-lg border border-white/10 px-3 py-2 text-sm text-white/55">Close</button>
            </div>

            <div className="mb-5 flex rounded-xl border border-white/10 bg-white/[0.03] p-1">
              <button type="button" onClick={() => setActiveTab("team")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "team" ? "bg-white text-black" : "text-white/50"}`}>Team</button>
              <button type="button" onClick={() => setActiveTab("clients")} className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "clients" ? "bg-white text-black" : "text-white/50"}`}>Client</button>
            </div>

            {activeTab === "team" ? (
              <form onSubmit={createTeam} className="space-y-4">
                <label><span className={labelCls}>Name</span><input className={inputCls} value={teamForm.name} onChange={(e) => setTeamForm({ ...teamForm, name: e.target.value })} required /></label>
                <label><span className={labelCls}>Email</span><input type="email" className={inputCls} value={teamForm.email} onChange={(e) => setTeamForm({ ...teamForm, email: e.target.value })} required /></label>
                <label><span className={labelCls}>Password</span><input type="password" className={inputCls} value={teamForm.password} onChange={(e) => setTeamForm({ ...teamForm, password: e.target.value })} required /></label>
                <label>
                  <span className={labelCls}>Access role</span>
                  <select className={inputCls} value={teamForm.role} onChange={(e) => setTeamForm({ ...teamForm, role: e.target.value as TeamRole })}>
                    <option value="team_manager">Team Manager - access, submissions, careers, questionnaires, calendars</option>
                    <option value="account_manager">Account Manager - questionnaires and content calendars only</option>
                    <option value="website_content">Website Content - website/CMS only</option>
                    <option value="admin">Admin - full access</option>
                  </select>
                </label>
                <button disabled={saving} className="w-full rounded-lg bg-[#01F17C] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50">Create Team Account</button>
              </form>
            ) : (
              <form onSubmit={createClient} className="space-y-4">
                <label><span className={labelCls}>Client name</span><input className={inputCls} value={clientForm.clientName} onChange={(e) => setClientForm({ ...clientForm, clientName: e.target.value })} required /></label>
                <label><span className={labelCls}>Username</span><input className={inputCls} value={clientForm.username} onChange={(e) => setClientForm({ ...clientForm, username: e.target.value })} required /></label>
                <label><span className={labelCls}>Password</span><input type="password" className={inputCls} value={clientForm.password} onChange={(e) => setClientForm({ ...clientForm, password: e.target.value })} required /></label>
                <label>
                  <span className={labelCls}>Questionnaire type</span>
                  <select className={inputCls} value={clientForm.questionnaireType} onChange={(e) => setClientForm({ ...clientForm, questionnaireType: e.target.value as QuestionnaireType })}>
                    <option value="standard">Standard content brief</option>
                    <option value="brand">Brand repositioning brief</option>
                    <option value="explanatory_animation">Explanatory animation brief</option>
                    <option value="media_buying_clinic">Media buying clinics brief</option>
                  </select>
                </label>
                <button disabled={saving} className="w-full rounded-lg bg-[#01F17C] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50">Create Client Account</button>
              </form>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3">
      <p className="text-sm text-white/42">{label}</p>
      <p className="mt-1 text-xl font-semibold tracking-[-0.01em] text-white">{value}</p>
    </div>
  );
}
