"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { DATA_MODE } from "@/lib/supabase/client";
import AuthCard from "@/components/layout/AuthCard";
import { Button, Input } from "@/components/ui";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try { await login(email, password); router.push("/dashboard"); }
    catch (err) { setError(err instanceof Error ? err.message : String(err)); }
  }

  return (
    <AuthCard>
      <h2 className="text-2xl font-bold text-navy">Iniciar sesión</h2>
      <p className="text-slate-500 text-sm mt-1">Accede a la plataforma de tu logia.</p>
      <form onSubmit={submit} className="space-y-4 mt-6">
        <Input label="Correo" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="tucorreo@ejemplo.mx" />
        <Input label="Contraseña" type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
        {error && <p className="text-rose-600 text-sm">{error}</p>}
        <Button type="submit" className="w-full">Entrar</Button>
      </form>
      {/* Acceso con Google: fuera de alcance por ahora (botón desactivado). */}
      <button type="button" disabled aria-disabled="true" title="Disponible próximamente"
        className="btn btn-ghost w-full mt-3 opacity-50 cursor-not-allowed">
        <span className="text-base">🔵</span> Continuar con Google (próximamente)
      </button>
      <p className="text-sm text-slate-500 mt-6 text-center">
        ¿Aún no tienes cuenta? <Link href="/register" className="text-royal font-medium">Regístrate</Link>
      </p>
      {DATA_MODE !== "supabase" && (
        <div className="mt-6 rounded-lg bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800">
          <b>Demo:</b> usa cualquiera de estos correos (sin contraseña real): master@demo.mx · gransecretario@demo.mx · secretario@demo.mx · tesorero@demo.mx · maestro@demo.mx · companero@demo.mx · aprendiz@demo.mx
        </div>
      )}
    </AuthCard>
  );
}
