"use client";

export const dynamic = "force-dynamic";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import AdminHeader from "@/components/admin/AdminHeader";
import ProjectForm from "@/components/admin/ProjectForm";

export default function NewProjectPage() {
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push("/admin/login");
    });
  }, [router]);

  return (
    <div className="p-6 lg:p-10">
      <AdminHeader
        title="New Project"
        actions={
          <Link href="/admin/projects" className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white hover:bg-white/10 transition-colors">
            ← Back
          </Link>
        }
      />
      <ProjectForm onSuccess={() => router.push("/admin/projects")} />
    </div>
  );
}
