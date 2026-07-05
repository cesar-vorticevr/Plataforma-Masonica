"use client";
import { useEffect } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Card, Button } from "@/components/ui";

// Pantalla para cuentas bloqueadas: cierra la sesión al entrar y explica el estado.
export default function CuentaBloqueada() {
  useEffect(() => { createClient().auth.signOut(); }, []);
  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="max-w-md text-center">
        <div className="text-3xl mb-2">🚫</div>
        <h1 className="text-lg font-semibold text-navy mb-2">Cuenta bloqueada</h1>
        <p className="text-sm text-slate-500 mb-4">
          Tu acceso a la plataforma está bloqueado. Tus datos se conservan. Contacta al secretario de
          tu logia para más información.
        </p>
        <Link href="/login"><Button variant="ghost" className="w-full">Volver al inicio de sesión</Button></Link>
      </Card>
    </div>
  );
}
