"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Card, PageTitle, Button, Input, Select, Badge, Modal } from "@/components/ui";
import {
  adminValidar, adminSetEstado,
  adminSetRol, adminCambiarPalabra, adminCrearLogia,
  adminDesignarSecretario, adminQuitarSecretario,
} from "@/lib/data/identidad";
import { getGenerales } from "@/lib/data/generales";
import { escribirLogiaActiva } from "@/lib/logia-activa";
import { Grado, GRADO_LABEL, ROL_LABEL, Usuario, Logia, Generales } from "@/lib/types";
import { fecha } from "@/lib/format";

// Isla de administración: renderiza directo desde los props del servidor (fuente única de verdad).
// La logia sobre la que opera un admin global la fija el selector del header (logia activa); tras
// cambiar de logia o tras una mutación, router.refresh() recarga los datos desde el servidor.
export default function AdminClient({ global, logiaId, logia, usuarios }:
  { global: boolean; logiaId: string; logia: Logia | undefined; usuarios: Usuario[] }) {
  const router = useRouter();

  function refrescar() {
    router.refresh();
  }

  // Al crear una logia, se vuelve la logia activa: se fija la cookie y se refresca desde el servidor
  // (así el selector del header y esta página apuntan a la nueva logia).
  function alCrearLogia(id: string) {
    escribirLogiaActiva(id);
    router.refresh();
  }

  if (!logia) {
    // Admin global y aún no existe ninguna logia: este es el único lugar donde el master puede dar
    // de alta la primera logia, así que el formulario debe estar presente (no solo un mensaje).
    if (global && !logiaId) {
      return (
        <div>
          <PageTitle title="Administración" subtitle="Gestión de logias, secretarios y hermanos." />
          <div className="grid lg:grid-cols-3 gap-4 mb-6">
            <CrearLogia onCreated={alCrearLogia} />
          </div>
          <Card><div className="p-6 text-center text-slate-400 text-sm">Aún no hay logias creadas. Crea la primera para empezar a registrar hermanos.</div></Card>
        </div>
      );
    }
    return <div className="min-h-[40vh] grid place-items-center text-slate-400">Cargando…</div>;
  }

  return (
    <div>
      <PageTitle title="Administración" subtitle={global ? "Gestión de logias, secretarios y hermanos." : "Gestión de los hermanos de tu logia."} />

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <PalabraClave logia={logia} onSave={() => refrescar()} />
        {global && <CrearLogia onCreated={alCrearLogia} />}
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="p-4 border-b font-semibold text-navy">Hermanos de {logia.nombre}</div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-slate-500 border-b">
            <th className="p-3">Hermano</th><th>Rol / Grado</th><th>Estado</th><th>Registro</th><th></th></tr></thead>
          <tbody>
            {usuarios.map(u => (
              <UsuarioRow key={u.id} u={u} global={global} onChange={() => refrescar()} />
            ))}
          </tbody>
        </table>
        {usuarios.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">No hay hermanos registrados en esta logia.</div>}
      </Card>
    </div>
  );
}

function UsuarioRow({ u, global, onChange }: { u: Usuario; global: boolean; onChange: () => void }) {
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
      {open && <td><GestionUsuario u={u} global={global} onClose={() => { setOpen(false); onChange(); }} /></td>}
    </tr>
  );
}

function GestionUsuario({ u, global, onClose }: { u: Usuario; global: boolean; onClose: () => void }) {
  const [grado, setGrado] = useState<Grado>(u.grado ?? "aprendiz");
  const [guardando, setGuardando] = useState(false);
  const [generales, setGenerales] = useState<Generales | null>(null);

  useEffect(() => { getGenerales(createClient(), u.id).then(setGenerales); }, [u.id]);

  async function accion(fn: (sb: ReturnType<typeof createClient>) => Promise<void>) {
    setGuardando(true);
    try { await fn(createClient()); onClose(); } finally { setGuardando(false); }
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
            <Button disabled={guardando} onClick={() => accion(sb => adminValidar(sb, u.id, grado))}>Validar</Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Al validar y asignar grado se habilita el acceso completo.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" disabled={guardando}
            onClick={() => accion(sb => adminSetRol(sb, u.id, u.rol === "tesorero" ? "hermano" : "tesorero"))}>
            {u.rol === "tesorero" ? "Quitar tesorero" : "Dar acceso de tesorero"}
          </Button>
          <Button variant="ghost" disabled={guardando}
            onClick={() => accion(sb => adminSetEstado(sb, u.id, u.estado === "bloqueado" ? "validado" : "bloqueado"))}>
            {u.estado === "bloqueado" ? "Desbloquear" : "Bloquear"}
          </Button>
        </div>

        {global && (
          <div>
            <label className="label">Secretario de la logia (solo Gran Secretaría)</label>
            {u.rol === "secretario" ? (
              <Button variant="ghost" disabled={guardando} className="w-full"
                onClick={() => accion(sb => adminQuitarSecretario(sb, u.id))}>
                Quitar secretario
              </Button>
            ) : (
              <Button variant="ghost" disabled={guardando || u.estado !== "validado"} className="w-full"
                onClick={() => accion(sb => adminDesignarSecretario(sb, u.id))}>
                Designar secretario
              </Button>
            )}
            <p className="text-xs text-slate-400 mt-1">
              {u.estado !== "validado" && u.rol !== "secretario"
                ? "Primero valida al hermano para poder designarlo."
                : "Cada logia tiene un solo secretario; al designar, el anterior vuelve a hermano."}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CrearLogia({ onCreated }: { onCreated: (id: string) => void }) {
  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [oriente, setOriente] = useState("");
  const [clave, setClave] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState("");

  const numeroOk = /^\d+$/.test(numero.trim());
  const valido = !!nombre.trim() && !!oriente.trim() && !!clave.trim() && numeroOk;

  async function crear() {
    if (!valido) { setError("Completa nombre, número, oriente y palabra clave."); return; }
    setGuardando(true); setError("");
    try {
      const id = await adminCrearLogia(createClient(), {
        nombre: nombre.trim(), numero: parseInt(numero, 10),
        oriente: oriente.trim(), clave: clave.trim(),
      });
      if (!id) { setError("No se pudo crear la logia. Verifica tus permisos."); return; }
      setNombre(""); setNumero(""); setOriente(""); setClave("");
      onCreated(id);
    } finally { setGuardando(false); }
  }

  return (
    <Card>
      <h3 className="font-semibold text-navy mb-2 text-sm">Crear logia</h3>
      <div className="space-y-2">
        <Input value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Nombre" />
        <div className="flex gap-2">
          <Input value={numero} onChange={e => setNumero(e.target.value)} placeholder="N.°" inputMode="numeric" />
          <Input value={oriente} onChange={e => setOriente(e.target.value)} placeholder="Oriente (ciudad)" />
        </div>
        <Input value={clave} onChange={e => setClave(e.target.value)} placeholder="Palabra clave" />
        <Button onClick={crear} disabled={guardando || !valido} className="w-full">Crear logia</Button>
        {error && <p className="text-rose-600 text-sm">{error}</p>}
      </div>
      <p className="text-xs text-slate-400 mt-1">Habilita el registro de hermanos en la nueva logia.</p>
    </Card>
  );
}

function PalabraClave({ logia, onSave }: { logia: Logia; onSave: () => void }) {
  // No se muestra el hash: el campo arranca vacío para fijar una nueva palabra clave.
  const [val, setVal] = useState("");
  const [guardando, setGuardando] = useState(false);
  async function guardar() {
    if (!val) return;
    setGuardando(true);
    try { await adminCambiarPalabra(createClient(), logia.id, val); setVal(""); onSave(); } finally { setGuardando(false); }
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
