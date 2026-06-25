"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import { NAV } from "./nav";
import { ROL_LABEL, GRADO_LABEL } from "@/lib/types";
import { initials } from "@/lib/format";

interface LogiaInfo { nombre: string; numero: number; oriente: string }

export default function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [notif, setNotif] = useState(0);
  const [badges, setBadges] = useState<Record<string, number>>({});
  const [logia, setLogia] = useState<LogiaInfo | null>(null);

  useEffect(() => {
    const h = () => setNotif(n => n + 1);
    window.addEventListener("notif", h);
    return () => window.removeEventListener("notif", h);
  }, []);

  useEffect(() => {
    if (!user) return;
    let on = true;
    Promise.all(
      NAV.filter(i => i.badge && i.show(user))
        .map(async i => [i.href, await i.badge!(user)] as const)
    ).then(entries => { if (on) setBadges(Object.fromEntries(entries)); });
    return () => { on = false; };
  }, [user, notif]);

  useEffect(() => {
    if (!user?.logia_id) return;
    createClient().from("logias").select("nombre,numero,oriente").eq("id", user.logia_id).single()
      .then(({ data }) => setLogia((data as LogiaInfo) ?? null));
  }, [user?.logia_id]);

  if (!user) return null;
  const items = NAV.filter(i => i.show(user));

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed lg:static z-40 w-64 bg-navy text-white min-h-screen flex flex-col transition ${open ? "" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="p-5 border-b border-white/10">
          <div className="font-bold text-lg leading-tight">Gran Logia</div>
          <div className="text-gold font-semibold">Restauración</div>
          <div className="text-xs text-white/50 mt-1">Plataforma Masónica</div>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {items.map(i => {
            const active = path === i.href || path.startsWith(i.href + "/");
            return (
              <Link key={i.href} href={i.href} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${active ? "bg-white/15 font-semibold" : "text-white/80 hover:bg-white/10"}`}>
                <span>{i.icon}</span><span className="flex-1">{i.label}</span>
                {(() => { const n = badges[i.href] ?? 0; return n > 0 ? <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-rose-500 text-white text-[11px] font-semibold">{n}</span> : null; })()}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/10 text-xs text-white/50">
          v1.0
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-slate-200 px-4 lg:px-8 py-3 flex items-center justify-between gap-4 sticky top-0 z-30">
          <button className="lg:hidden text-slate-600" onClick={() => setOpen(!open)}>☰</button>
          <div className="hidden sm:block text-sm text-slate-500">
            {logia ? `Resp.·. Log.·. ${logia.nombre} N.°${logia.numero} · Or.·. ${logia.oriente}` : ""}
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-navy text-white grid place-items-center text-sm font-semibold">{initials(user.nombre)}</div>
              <div className="hidden sm:block leading-tight">
                <div className="text-sm font-medium text-slate-800">{user.nombre}</div>
                <div className="text-xs text-slate-500">{ROL_LABEL[user.rol]}{user.grado ? ` · ${GRADO_LABEL[user.grado]}` : ""}</div>
              </div>
            </div>
            <button onClick={logout} className="btn btn-ghost text-xs">Salir</button>
          </div>
        </header>
        <main className="p-4 lg:p-8 max-w-6xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
