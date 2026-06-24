"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { esGlobal } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Select, Badge, Modal } from "@/components/ui";
import {
  listLogias, listUsuariosLogia, listUsuarios, getLogia, validarUsuario, actualizarUsuario,
  cambiarPalabraClaveLogia, crearLogia, crearUsuario, getGenerales,
} from "@/lib/data/store";
import { Grado, GRADO_LABEL, ROL_LABEL, Usuario, Logia } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function Admin() {
  const { user } = useAuth();
  if (!user) return null;
  return <AdminInner user={user} />;
}

function AdminInner({ user }: { user: Usuario }) {
  const [tick, setTick] = useState(0);
  const [logiaSel, setLogiaSel] = useState(user.logia_id);
  const global = esGlobal(user.rol);
  const logias = listLogias();
  const usuarios = global ? listUsuarios().filter(u => u.logia_id === logiaSel) : listUsuariosLogia(user.logia_id);
  const logia = getLogia(global ? logiaSel : user.logia_id)!;
  const refresh = () => setTick(t => t + 1);

  return (
    <div key={tick}>
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
        {global && <AltaRapida onDone={refresh} />}
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
  const g = getGenerales(u.id);
  return (
    <Modal open onClose={onClose} title={`Gestionar a ${u.nombre.split("(")[0].trim()}`}>
      <div className="space-y-4">
        <div className="rounded-lg bg-slate-50 p-3 text-sm">
          <div className="font-medium text-slate-700 mb-1">Generales (solo administradores)</div>
          {g ? (
            <div className="text-slate-600 text-xs space-y-0.5">
              <div>Nacimiento: {fecha(g.fecha_nacimiento)} · Tel: {g.telefono ?? "—"}</div>
              <div>Emergencia: {g.contacto_emergencia_nombre ?? "—"} ({g.contacto_emergencia_tel ?? "—"})</div>
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
            <Button onClick={() => { validarUsuario(u.id, grado); onClose(); }}>Validar</Button>
          </div>
          <p className="text-xs text-slate-400 mt-1">Al validar y asignar grado se habilita el acceso completo.</p>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="ghost" onClick={() => { actualizarUsuario(u.id, { rol: u.rol === "tesorero" ? "hermano" : "tesorero" }); onClose(); }}>
            {u.rol === "tesorero" ? "Quitar tesorero" : "Dar acceso de tesorero"}
          </Button>
          <Button variant="ghost" onClick={() => { actualizarUsuario(u.id, { estado: u.estado === "bloqueado" ? "validado" : "bloqueado" }); onClose(); }}>
            {u.estado === "bloqueado" ? "Desbloquear" : "Bloquear"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PalabraClave({ logia, onSave }: { logia: Logia; onSave: () => void }) {
  const [val, setVal] = useState(logia.palabra_clave);
  return (
    <Card>
      <h3 className="font-semibold text-navy mb-2 text-sm">Palabra clave de la logia</h3>
      <div className="flex gap-2">
        <Input value={val} onChange={e => setVal(e.target.value)} />
        <Button onClick={() => { cambiarPalabraClaveLogia(logia.id, val); onSave(); }}>Guardar</Button>
      </div>
      <p className="text-xs text-slate-400 mt-1">Controla quién puede registrarse en esta logia.</p>
    </Card>
  );
}

function AltaRapida({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState<"logia" | "secretario" | null>(null);
  const logias = listLogias();
  const [lf, setLf] = useState({ nombre: "", numero: "", oriente: "" });
  const [sf, setSf] = useState({ nombre: "", email: "", logiaId: logias[0]?.id ?? "" });
  return (
    <Card>
      <h3 className="font-semibold text-navy mb-2 text-sm">Altas</h3>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ghost" onClick={() => setOpen("logia")}>+ Logia</Button>
        <Button variant="ghost" onClick={() => setOpen("secretario")}>+ Secretario</Button>
      </div>
      {open === "logia" && (
        <Modal open onClose={() => setOpen(null)} title="Alta de logia">
          <div className="space-y-3">
            <Input label="Nombre" value={lf.nombre} onChange={e => setLf(s => ({ ...s, nombre: e.target.value }))} />
            <Input label="Número" type="number" value={lf.numero} onChange={e => setLf(s => ({ ...s, numero: e.target.value }))} />
            <Input label="Oriente" value={lf.oriente} onChange={e => setLf(s => ({ ...s, oriente: e.target.value }))} />
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(null)}>Cancelar</Button>
              <Button onClick={() => { if (lf.nombre) { crearLogia({ nombre: lf.nombre, numero: Number(lf.numero) || 0, oriente: lf.oriente }); setOpen(null); onDone(); } }}>Crear</Button></div>
          </div>
        </Modal>
      )}
      {open === "secretario" && (
        <Modal open onClose={() => setOpen(null)} title="Alta de secretario">
          <div className="space-y-3">
            <Input label="Nombre" value={sf.nombre} onChange={e => setSf(s => ({ ...s, nombre: e.target.value }))} />
            <Input label="Correo" value={sf.email} onChange={e => setSf(s => ({ ...s, email: e.target.value }))} />
            <Select label="Logia" value={sf.logiaId} onChange={e => setSf(s => ({ ...s, logiaId: e.target.value }))}>
              {logias.map(l => <option key={l.id} value={l.id}>{l.nombre}</option>)}
            </Select>
            <div className="flex justify-end gap-2"><Button variant="ghost" onClick={() => setOpen(null)}>Cancelar</Button>
              <Button onClick={() => {
                if (sf.nombre && sf.email) {
                  const nu = crearUsuario({ nombre: sf.nombre, email: sf.email, logia_id: sf.logiaId, rol: "secretario" });
                  actualizarUsuario(nu.id, { estado: "validado", grado: "maestro" });
                  setOpen(null); onDone();
                }
              }}>Crear</Button></div>
          </div>
        </Modal>
      )}
    </Card>
  );
}
