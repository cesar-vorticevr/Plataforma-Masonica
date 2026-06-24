"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Usuario } from "./types";
import { getUsuario, getUsuarioPorEmail, crearUsuario, db } from "./data/store";

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
  const [user, setUserState] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Restaura la sesión desde localStorage tras el montaje. Se hace en un efecto (y no con un
    // inicializador perezoso) para evitar un hydration mismatch: en SSR no existe localStorage,
    // así que el estado inicial debe coincidir (null) en servidor y cliente, y la restauración
    // ocurre solo en el cliente. Los setState síncronos de montaje son intencionales aquí.
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
    // En modo demo entra como un hermano de ejemplo.
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

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fuera de AuthProvider");
  return c;
}
