"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { Card, PageTitle, Button, Input } from "@/components/ui";
import { getGenerales, guardarGenerales } from "@/lib/data/store";
import { Generales } from "@/lib/types";

export default function GeneralesPage() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [g, setG] = useState<Generales>(() =>
    getGenerales(user!.id) ?? { usuario_id: user!.id });
  if (!user) return null;
  const set = (k: keyof Generales, v: string) => { setG(s => ({ ...s, [k]: v })); setSaved(false); };

  function guardar(e: React.FormEvent) { e.preventDefault(); guardarGenerales(g); setSaved(true); }

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
            <Button type="submit">Guardar generales</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
