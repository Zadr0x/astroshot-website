"use client";

interface AdminHeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export default function AdminHeader({ title, actions }: AdminHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-2xl font-black text-white tracking-tight">{title}</h1>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}
