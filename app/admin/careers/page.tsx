"use client";

import { useState, useEffect } from "react";

type Role = {
  id: string;
  title: string;
  status: "open" | "closed";
};

const DEFAULT_ROLES: Role[] = [
  { id: "vfx", title: "Senior VFX Artist", status: "open" },
  { id: "social", title: "Social Media Manager", status: "open" },
  { id: "motion", title: "Motion Graphics Designer", status: "open" },
];

const STORAGE_KEY = "astroshot_careers_roles";

export default function CareersAdminPage() {
  const [roles, setRoles] = useState<Role[]>(DEFAULT_ROLES);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setRoles(JSON.parse(saved));
    } catch {}
  }, []);

  const save = (updated: Role[]) => {
    setRoles(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleStatus = (id: string) => {
    save(roles.map((r) => r.id === id ? { ...r, status: r.status === "open" ? "closed" : "open" } : r));
  };

  const startEdit = (role: Role) => {
    setEditingId(role.id);
    setEditTitle(role.title);
  };

  const commitEdit = (id: string) => {
    if (editTitle.trim()) {
      save(roles.map((r) => r.id === id ? { ...r, title: editTitle.trim() } : r));
    }
    setEditingId(null);
  };

  const addRole = () => {
    const newRole: Role = {
      id: `role-${Date.now()}`,
      title: "New Role",
      status: "open",
    };
    const updated = [...roles, newRole];
    save(updated);
    startEdit(newRole);
  };

  const removeRole = (id: string) => {
    save(roles.filter((r) => r.id !== id));
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Career Applications</h1>
        <p className="text-[#666666] text-sm mt-1">Manage open roles and track inbound applications.</p>
      </div>

      {/* Applications notice */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-5 mb-8">
        <div className="flex items-start gap-3">
          <span className="text-[#01F17C] text-lg mt-0.5">◎</span>
          <div>
            <p className="text-white text-sm font-semibold mb-1">Applications go to your inbox</p>
            <p className="text-[#666666] text-sm">
              Career applications submitted via the Careers page are sent directly to{" "}
              <span className="text-white font-medium">info@astroshotpm.com</span>. Check your email for incoming talent.
            </p>
          </div>
        </div>
      </div>

      {/* Open Roles */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <h2 className="text-white font-semibold text-sm">Open Roles</h2>
          <button
            onClick={addRole}
            className="text-xs font-semibold text-[#01F17C] hover:text-white transition-colors px-3 py-1.5 border border-[#01F17C]/30 rounded-lg hover:border-white/30"
          >
            + Add Role
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {roles.map((role) => (
            <div key={role.id} className="flex items-center gap-4 px-5 py-4">
              {/* Status dot */}
              <button
                onClick={() => toggleStatus(role.id)}
                title="Toggle open/closed"
                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-colors ${
                  role.status === "open" ? "bg-[#01F17C]" : "bg-[#444444]"
                }`}
              />

              {/* Title */}
              <div className="flex-1 min-w-0">
                {editingId === role.id ? (
                  <input
                    autoFocus
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => commitEdit(role.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(role.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    className="bg-[#1a1a1a] border border-[#01F17C]/40 text-white text-sm rounded-lg px-3 py-1 w-full outline-none focus:border-[#01F17C]"
                  />
                ) : (
                  <button
                    onClick={() => startEdit(role)}
                    className="text-white text-sm text-left hover:text-[#01F17C] transition-colors"
                  >
                    {role.title}
                  </button>
                )}
              </div>

              {/* Status badge */}
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                  role.status === "open"
                    ? "bg-[#01F17C]/10 text-[#01F17C]"
                    : "bg-white/5 text-[#666666]"
                }`}
              >
                {role.status === "open" ? "Open" : "Closed"}
              </span>

              {/* Remove */}
              <button
                onClick={() => removeRole(role.id)}
                className="text-[#444444] hover:text-red-400 transition-colors text-sm"
                title="Remove role"
              >
                ✕
              </button>
            </div>
          ))}

          {roles.length === 0 && (
            <div className="px-5 py-8 text-center text-[#444444] text-sm">
              No roles yet. Click <span className="text-white">+ Add Role</span> to create one.
            </div>
          )}
        </div>
      </div>

      <p className="text-[#444444] text-xs mt-4">
        Role list is stored locally in this browser. Toggle the dot to open/close a role. Click the title to rename it.
      </p>
    </div>
  );
}
