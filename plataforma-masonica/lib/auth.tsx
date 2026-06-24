"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EstadoUsuario, Grado, Rol, Usuario } from "./types";
import { getUsuario, getUsuarioPorEmail, crearUsuario, db } from "./data/store";
import { createClient, DATA_MODE } from "./supabase/client";

const SESSION_KEY = "plataforma_masonica_session";

interface AuthCtx {
  user: Usuario | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<Usuario>;
  loginGoogle: () => Promise<Usuario>;
  registrar: (data: RegistroData) => Promise<Usuario>;
  logout: () => void;
  setUser: (u: Usuario) => void;        // para demo / refresco
  switchDemo: (id: string) => void;     // cambiar de usuario en modo demo
}
export interface RegistroData {
  nombre: string; email: string; password: string;
  palabraGeneral: string; logiaId: string; palabraLogia: string;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return DATA_MODE === "supabase"
    ? <SupabaseAuthProvider>{children}</SupabaseAuthProvider>
    : <MockAuthProvider>{children}</MockAuthProvider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}

// ====================================================================
// Proveedor SUPABASE (producción / desarrollo local con backend real)
// ====================================================================
interface PerfilRow {
  id: string; nombre: string; email: string; rol: Rol; grado: Grado;
  logia_id: string | null; estado: EstadoUsuario; foto: string | null; fecha_registro: string;
}
function perfilAUsuario(p: PerfilRow): Usuario {
  return {
    id: p.id, nombre: p.nombre, email: p.email, rol: p.rol, grado: p.grado,
    logia_id: p.logia_id ?? "", estado: p.estado, foto: p.foto ?? undefined,
    fecha_registro: p.fecha_registro,
  };
}

function SupabaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const cargarPerfil = useCallback(async (uid: string): Promise<Usuario | null> => {
    const { data } = await supabase.from("perfiles").select("*").eq("id", uid).single();
    const u = data ? perfilAUsuario(data as PerfilRow) : null;
    setUserState(u);
    return u;
  }, [supabase]);

  useEffect(() => {
    let activo = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!activo) return;
      if (data.user) await cargarPerfil(data.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, session) => {
      if (session?.user) void cargarPerfil(session.user.id);
      else setUserState(null);
    });
    return () => { activo = false; sub.subscription.unsubscribe(); };
  }, [supabase, cargarPerfil]);

  async function login(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error("Correo o contraseña incorrectos.");
    const { data } = await supabase.auth.getUser();
    const u = data.user ? await cargarPerfil(data.user.id) : null;
    if (!u) throw new Error("No se pudo cargar tu perfil.");
    if (u.estado === "bloqueado") { await supabase.auth.signOut(); throw new Error("Tu cuenta está bloqueada. Contacta a tu secretario."); }
    return u;
  }

  async function loginGoogle(): Promise<Usuario> {
    throw new Error("El acceso con Google no está disponible por ahora.");
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
  function setUser(u: Usuario) { setUserState({ ...u }); }
  function switchDemo() { /* sin efecto en modo supabase */ }

  return (
    <Ctx.Provider value={{ user, loading, login, loginGoogle, registrar, logout, setUser, switchDemo }}>
      {children}
    </Ctx.Provider>
  );
}

// ====================================================================
// Proveedor MOCK (demo con datos en localStorage)
// ====================================================================
function MockAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restaura la sesión desde localStorage tras el montaje (SSR-safe).
    /* eslint-disable react-hooks/set-state-in-effect */
    const id = typeof window !== "undefined" ? localStorage.getItem(SESSION_KEY) : null;
    if (id) { const u = getUsuario(id); if (u) setUserState(u); }
    setLoading(false);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  function persistSession(u: Usuario | null) {
    if (typeof window === "undefined") return;
    if (u) localStorage.setItem(SESSION_KEY, u.id); else localStorage.removeItem(SESSION_KEY);
  }
  function setUser(u: Usuario) { setUserState({ ...u }); persistSession(u); }

  async function login(email: string, _password: string) {
    const u = getUsuarioPorEmail(email);
    if (!u) throw new Error("No existe una cuenta con ese correo. (En la demo usa los correos de ejemplo).");
    if (u.estado === "bloqueado") throw new Error("Tu cuenta está bloqueada. Contacta a tu secretario.");
    setUser(u); return u;
  }
  async function loginGoogle() {
    const u = getUsuarioPorEmail("aprendiz@demo.mx")!;
    setUser(u); return u;
  }
  async function registrar(data: RegistroData) {
    const general = db().config.palabra_clave_general;
    if (data.palabraGeneral.trim().toLowerCase() !== general.toLowerCase())
      throw new Error("La palabra clave general de la Orden es incorrecta.");
    const logia = db().logias.find(l => l.id === data.logiaId);
    if (!logia) throw new Error("Selecciona una logia válida.");
    if (data.palabraLogia.trim().toLowerCase() !== logia.palabra_clave.toLowerCase())
      throw new Error("La palabra clave de la logia es incorrecta.");
    if (getUsuarioPorEmail(data.email)) throw new Error("Ya existe una cuenta con ese correo.");
    const u = crearUsuario({ nombre: data.nombre, email: data.email, logia_id: data.logiaId });
    setUser(u); return u;
  }
  function logout() { setUserState(null); persistSession(null); router.push("/login"); }
  function switchDemo(id: string) { const u = getUsuario(id); if (u) setUser(u); }

  return (
    <Ctx.Provider value={{ user, loading, login, loginGoogle, registrar, logout, setUser, switchDemo }}>
      {children}
    </Ctx.Provider>
  );
}
