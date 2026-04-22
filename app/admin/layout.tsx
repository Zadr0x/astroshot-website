import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050505]">
      <AdminSidebar />
      {/* Content area offset for sidebar on desktop, top bar on mobile */}
      <div className="lg:ml-60 pt-14 lg:pt-0 min-h-screen">
        {children}
      </div>
    </div>
  );
}
