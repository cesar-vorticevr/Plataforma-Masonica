"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createClient } from "@/lib/supabase/client";
import AuthCard from "@/components/layout/AuthCard";
import { Button, Input, Select } from "@/components/ui";

interface LogiaOpcion { id: string; nombre: string; numero: number; oriente: string }

export default function RegisterPage() {
  const { registrar } = useAuth();
  const router = useRouter();
  const [logias, setLogias] = useState<LogiaOpcion[]>([]);
  const [f, setF] = useState({
    palabraGeneral: "", logiaId: "", palabraLogia: "",
    nombre: "", email: "", password: "", confirm: "",
  });
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setF(s => ({ ...s, [k]: v }));

  useEffect(() => {
    createClient().from("logias").select("id,nombre,numero,oriente").order("numero")
      .then(({ data }) => {
        const ls = (data ?? []) as LogiaOpcion[];
        setLogias(ls);
        setF(s => ({ ...s, logiaId: s.logiaId || (ls[0]?.id ?? "") }));
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (f.password !== f.confirm) { setError("Las contraseñas no coinciden."); return; }
    if (f.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    try {
      await registrar({ nombre: f.nombre, email: f.email, password: f.password,
        palabraGeneral: f.palabraGeneral, logiaId: f.logiaId, palabraLogia: f.palabraLogia });
      router.push("/dashboard");
    } catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }

  return (
    <AuthCard>
      <h2 className="text-2xl font-bold text-navy">Crear registro</h2>
      <p className="text-slate-500 text-sm mt-1">Necesitas la palabra clave de la Orden y la de tu logia.</p>
      <form onSubmit={submit} className="space-y-3 mt-5">
        <Input label="Palabra clave de la Orden" required value={f.palabraGeneral}
          onChange={e => set("palabraGeneral", e.target.value)} placeholder="(pista demo: BOAZ)" />
        <Select label="Logia a la que perteneces" value={f.logiaId} onChange={e => set("logiaId", e.target.value)}>
          {logias.map(l => <option key={l.id} value={l.id}>{l.nombre} N.°{l.numero} · {l.oriente}</option>)}
        </Select>
        <Input label="Palabra clave de la logia" required value={f.palabraLogia}
          onChange={e => set("palabraLogia", e.target.value)} placeholder="(pista demo: BOAZ)" />
        <hr className="my-2" />
        <Input label="Nombre completo" required value={f.nombre} onChange={e => set("nombre", e.target.value)} />
        <Input label="Correo" type="email" required value={f.email} onChange={e => set("email", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Contraseña" type="password" required value={f.password} onChange={e => set("password", e.target.value)} />
          <Input label="Confirmar contraseña" type="password" required value={f.confirm} onChange={e => set("confirm", e.target.value)} />
        </div>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full">Registrarme</Button>
      </form>
      <p className="text-xs text-slate-500 mt-4">
        Al registrarte aceptas el <Link href="/privacidad" className="text-royal underline">Aviso de Privacidad</Link>.
        Tu cuenta quedará <b>pendiente</b> hasta que el secretario de tu logia te valide y asigne tu grado.
      </p>
      <p className="text-sm text-slate-500 mt-4 text-center">
        ¿Ya tienes cuenta? <Link href="/login" className="text-royal font-medium">Inicia sesión</Link>
      </p>
    </AuthCard>
  );
}
