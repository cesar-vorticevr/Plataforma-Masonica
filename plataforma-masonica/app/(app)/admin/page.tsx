"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { esGlobal } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Select, Badge, Modal } from "@/components/ui";
import {
  adminListLogias, adminGetLogia, adminListUsuarios, adminValidar, adminSetEstado,
  adminSetRol, adminCambiarPalabra,
} from "@/lib/data/identidad";
import { getGenerales } from "@/lib/data/generales";
import { createClient } from "@/lib/supabase/client";
import { Grado, GRADO_LABEL, ROL_LABEL, Usuario, Logia, Generales } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function Admin() {
  const { user } = useAuth();
  if (!user) return null;
  return <AdminInner user={user} />;
}

function AdminInner({ user }: { user: Usuario }) {
  const global = esGlobal(user.rol);
  const [logiaSel, setLogiaSel] = useState(user.logia_id);
  const [logias, setLogias] = useState<Logia[]>([]);
  const [logia, setLogia] = useState<Logia | undefined>(undefined);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [tick, setTick] = useState(0);
  const refresh = () => setTick(t => t + 1);
  const logiaId = global ? logiaSel : user.logia_id;

  useEffect(() => {
    let activo = true;
    (async () => {
      const [ls, lg, us] = await Promise.all([
        global ? adminListLogias() : Promise.resolve([] as Logia[]),
        adminGetLogia(logiaId),
        adminListUsuarios(logiaId),
      ]);
      if (!activo) return;
      setLogias(ls); setLogia(lg); setUsuarios(us); setLoading(false);
    })();
    return () => { activo = false; };
  }, [global, logiaId, tick]);

  if (loading || !logia) return <div className="min-h-[40vh] grid place-items-center text-slate-400">Cargando…</div>;

  return (
    <div>
      <PageTitle title="Administración" subtitle={global ? "Gestión de logias, secretarios y hermanos." : "Gestión de los hermanos de tu logia."} />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {global && (
          <Card>
            <h3 className="font-semibold text-navy mb-2 text-sm">Logia seleccionada</h3>
            <Select value={logiaSel} onChange={e => setLogiaSel(e.target.value)}>
              {logias.map(l => <option key={l.id} value={l.id}>{l.nombre} N.°{l.numero}</option>)}
            </Select>
          </Card>
        )}
        <PalabraClave logia={logia} onSave={refresh} />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b font-semibold text-navy">Hermanos de {logia.nombre}</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b">
            <th className="p-3">Hermano</th><th>Rol / Grado</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
          <tbody>
            {usuarios.map(u => (
              <UsuarioRow key={u.id} u={u} onChange={refresh} />
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">No hay hermanos registrados en esta logia.</div>}
      </Card>
    </div>
  );
}

function UsuarioRow({ u, onChange }: { u: Usuario; onChange: () => void }) {
  const [open, setOpen] = useState(false);
  const estadoColor = u.estado === "validado" ? "green" : u.estado === "bloqueado" ? "red" : "yellow";
  return (
    <tr className="border-b last:border-0">
      <td className="p-3">
        <div className="font-medium text-slate-800">{u.nombre.split("(")[0].trim()}</div>
        <div className="text-xs text-slate-400">{u.email}</div>
      </td>
      <td className="text-slate-600">{ROL_LABEL[u.rol]}{u.grado ? ` · ${GRADO_LABEL[u.grado]}` : ""}</td>
      <td><Badge color={estadoColor}>{u.estado}</Badge></td>
      <td className="text-slate-500 text-xs">{fecha(u.fecha_registro)}</td>
      <td className="text-right pr-3"><Button variant="ghost" className="text-xs" onClick={() => setOpen(true)}>Gestionar</Button></td>
      {open && <td><GestionUsuario u={u} onClose={() => { setOpen(false); onChange(); }} /></td>}
    </tr>
  );
}

function GestionUsuario({ u, onClose }: { u: Usuario; onClose: () => void }) {
  const [grado, setGrado] = useState<Grado>(u.grado ?? "aprendiz");
  const [guardando, setGuardando] = useState(false);
  const [generales, setGenerales] = useState<Generales | null>(null);

  useEffect(() => { getGenerales(createClient(), u.id).then(setGenerales); }, [u.id]);

  async function accion(fn: () => Promise<void>) {
    setGuardando(true);
    try { await fn(); onClose(); } finally { setGuardando(false); }
  }

  return (
    <Modal open onClose={onClose} title={`Gestionar a ${u.nombre.split("(")[0].trim()}`}>
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <div className="font-medium text-slate-700 mb-1">Generales (solo administradores)</div>
          {generales ? (
            <div className="text-slate-600 text-xs space-y-0.5">
              <div>Nacimiento: {fecha(generales.fecha_nacimiento)} · Tel: {generales.telefono ?? "—"}</div>
              <div>Emergencia: {generales.contacto_emergencia_nombre ?? "—"} ({generales.contacto_emergencia_tel ?? "—"})</div>
              <div>Dirección: {generales.direccion ?? "—"} · Sangre: {generales.tipo_sangre ?? "—"}</div>
            </div>
          ) : <div className="text-slate-400 text-xs">El hermano aún no llena sus generales.</div>}
        </div>

        <div>
          <label className="label">Validar y asignar grado</label>
          <div className="flex gap-2">
            <Select value={grado ?? "aprendiz"} onChange={e => setGrado(e.target.value as Grado)}>
              <option value="aprendiz">Aprendiz</option>
              <option value="companero">Compañero</option>
              <option value="maestro">Maestro</option>
            </Select>
            <Button disabled={guardando} onClick={() => accion(() => adminValidar(u.id, grado))}>Validar</Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Al validar y asignar grado se habilita el acceso completo.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" disabled={guardando}
            onClick={() => accion(() => adminSetRol(u.id, u.rol === "tesorero" ? "hermano" : "tesorero"))}>
            {u.rol === "tesorero" ? "Quitar tesorero" : "Dar acceso de tesorero"}
          </Button>
          <Button variant="ghost" disabled={guardando}
            onClick={() => accion(() => adminSetEstado(u.id, u.estado === "bloqueado" ? "validado" : "bloqueado"))}>
            {u.estado === "bloqueado" ? "Desbloquear" : "Bloquear"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PalabraClave({ logia, onSave }: { logia: Logia; onSave: () => void }) {
  // No se muestra el hash: el campo arranca vacío para fijar una nueva palabra clave.
  const [val, setVal] = useState("");
  const [guardando, setGuardando] = useState(false);
  async function guardar() {
    if (!val) return;
    setGuardando(true);
    try { await adminCambiarPalabra(logia.id, val); setVal(""); onSave(); } finally { setGuardando(false); }
  }
  return (
    <Card>
      <h3 className="font-semibold text-navy mb-2 text-sm">Palabra clave de la logia</h3>
      <div className="flex gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} placeholder="Nueva palabra clave" />
        <Button onClick={guardar} disabled={guardando}>Guardar</Button>
      </div>
      <p className="text-xs text-slate-400 mt-1">Controla quién puede registrarse en esta logia.</p>
    </Card>
  );
}
