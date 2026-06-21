"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import AppShell from "@/components/layout/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => { if (!loading && !user) router.replace("/login"); }, [user, loading, router]);
  if (loading || !user) return <div className="min-h-screen grid place-items-center text-slate-400">Cargando…</div>;
  return <AppShell>{children}</AppShell>;
}
