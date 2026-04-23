'use client';

import { useState } from 'react';

export default function ServiceEditor({ service, onSave }) {
  const [title, setTitle] = useState(service.title || '');
  const [description, setDescription] = useState(service.description || '');
  const [saving, setSaving] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    await onSave(service.id, { title, description });
    setSaving(false);
  };

  return (
    <form onSubmit={handleFormSubmit} className="bg-[#111] p-6 rounded-2xl border border-white/10">
      <h2 className="text-xl font-bold flex items-center gap-3 text-white mb-6">
        <span className="text-2xl text-[#01F17C]">{service.icon}</span>
        {service.title}
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#01F17C]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
            className="w-full px-3 py-2 bg-[#1a1a1a] border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:border-[#01F17C] resize-none"
          />
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 text-sm font-semibold rounded-lg bg-[#01F17C] text-black hover:bg-opacity-80 transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
