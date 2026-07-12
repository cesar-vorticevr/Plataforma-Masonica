"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "./types";
import { createClient } from "./supabase/client";
import { cargarPerfil as cargarPerfilDB } from "./data/perfil";

interface AuthCtx {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  registrar: (data: RegistroData) => Promise<Usuario>;
  logout: () => void;
}
export interface RegistroData {
  nombre: string; email: string; password: string;
  logiaId: string; palabraLogia: string;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  // Sembrado desde el server layout (getUser + perfil). Si se omite (uso legacy), el provider
  // resuelve la sesión en cliente. Si llega (incl. null), la sesión ya está resuelta en servidor.
  initialUser?: Usuario | null;
}) {
  const sembrado = initialUser !== undefined;
  const [user, setUserState] = useState<Usuario | null>(initialUser ?? null);
  const [loading, setLoading] = useState(!sembrado);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const cargarPerfil = useCallback(async (uid: string): Promise<Usuario | null> => {
    const u = await cargarPerfilDB(supabase, uid);
    setUserState(u);
    return u;
  }, [supabase]);

  useEffect(() => {
    let activo = true;
    // Solo resolvemos la sesión en cliente si no vino sembrada desde el servidor.
    if (!sembrado) {
      supabase.auth.getUser().then(async ({ data }) => {
        if (!activo) return;
        if (data.user) await cargarPerfil(data.user.id);
        setLoading(false);
      });
    }
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) void cargarPerfil(session.user.id);
      else setUserState(null);
    });
    return () => { activo = false; sub.subscription.unsubscribe(); };
  }, [supabase, cargarPerfil, sembrado]);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Correo o contraseña incorrectos.");
    const { data } = await supabase.auth.getUser();
    const u = data.user ? await cargarPerfil(data.user.id) : null;
    if (!u) throw new Error("No se pudo cargar tu perfil.");
    if (u.estado === "bloqueado") { await supabase.auth.signOut(); throw new Error("Tu cuenta está bloqueada. Contacta a tu secretario."); }
    return u;
  }

  async function registrar(data: RegistroData) {
    const res = await fetch("/api/registro", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json.error ?? "No se pudo completar el registro.");
    return login(data.email, data.password);
  }

  function logout() { void supabase.auth.signOut().then(() => { setUserState(null); router.push("/login"); }); }

  return (
    <Ctx.Provider value={{ user, loading, login, registrar, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}
