"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, PageTitle, Button, Input } from "@/components/ui";
import { guardarGenerales } from "@/lib/data/generales";
import { Generales } from "@/lib/types";

// Isla: formulario de generales. Recibe los datos iniciales del servidor y guarda con el
// cliente de navegador.
export default function GeneralesForm({ userId, inicial }: { userId: string; inicial: Generales | null }) {
  const [g, setG] = useState<Generales>(inicial ?? { usuario_id: userId });
  const [saved, setSaved] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const set = (k: keyof Generales, v: string) => { setG(s => ({ ...s, [k]: v })); setSaved(false); };

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    try { await guardarGenerales(createClient(), { ...g, usuario_id: userId }); setSaved(true); }
    finally { setGuardando(false); }
  }

  return (
    <div>
      <PageTitle title="Generales" subtitle="Datos de contacto. Solo los administradores y el secretario de tu logia pueden verlos." />
      <Card>
        <form onSubmit={guardar} className="grid sm:grid-cols-2 gap-4">
          <Input label="Fecha de nacimiento" type="date" value={g.fecha_nacimiento ?? ""} onChange={e => set("fecha_nacimiento", e.target.value)} />
          <Input label="Teléfono" value={g.telefono ?? ""} onChange={e => set("telefono", e.target.value)} />
          <Input label="Dirección" value={g.direccion ?? ""} onChange={e => set("direccion", e.target.value)} className="sm:col-span-2" />
          <Input label="Contacto de emergencia (nombre)" value={g.contacto_emergencia_nombre ?? ""} onChange={e => set("contacto_emergencia_nombre", e.target.value)} />
          <Input label="Contacto de emergencia (teléfono)" value={g.contacto_emergencia_tel ?? ""} onChange={e => set("contacto_emergencia_tel", e.target.value)} />
          <Input label="Tipo de sangre" value={g.tipo_sangre ?? ""} onChange={e => set("tipo_sangre", e.target.value)} />
          <Input label="Notas / otros datos útiles" value={g.notas ?? ""} onChange={e => set("notas", e.target.value)} />
          <div className="sm:col-span-2 flex items-center justify-end gap-3 pt-2 border-t">
            {saved && <span className="text-emerald-600 text-sm">✓ Guardado</span>}
            <Button type="submit" disabled={guardando}>Guardar generales</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
