type StatusBadgeProps = {
  status: string;
};

const styles: Record<string, string> = {
  draft: "bg-[#333] text-[#999]",
  published: "bg-[#01F17C]/10 text-[#01F17C]",
  new: "bg-red-500/10 text-red-400",
  read: "bg-blue-500/10 text-blue-400",
  replied: "bg-purple-500/10 text-purple-400",
  active: "bg-[#01F17C]/10 text-[#01F17C]",
  inactive: "bg-[#333] text-[#999]",
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const cls = styles[status] ?? "bg-white/10 text-white/60";
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${cls}`}>
      {status}
    </span>
  );
}
