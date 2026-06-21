"use client";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { puedeVerTrabajo, nivelCamara } from "@/lib/roles";
import { Card, PageTitle, Button, Input, Textarea, Select, Badge, Empty, Modal } from "@/components/ui";
import { listTrabajosLogia, addTrabajo, getUsuario } from "@/lib/data/store";
import { Camara, CAMARA_LABEL, TRABAJO_LABEL } from "@/lib/types";
import { fecha } from "@/lib/format";

export default function Trabajos() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [filtro, setFiltro] = useState<string>("todos");
  const [tick, setTick] = useState(0);
  if (!user || !user.grado) return null;

  const visibles = listTrabajosLogia(user.logia_id)
    .filter(t => puedeVerTrabajo(user.grado, t.camara))
    .filter(t => filtro === "todos" || t.camara === filtro);

  const camarasDisponibles: Camara[] = (["aprendiz", "companero", "maestro"] as Camara[])
    .filter(c => nivelCamara(c) <= nivelCamara(user.grado as Camara));

  return (
    <div key={tick}>
      <PageTitle title="Trabajos, Burilados y Trazados"
        subtitle="Solo ves trabajos de tu cámara y de las inferiores."
        action={<Button onClick={() => setOpen(true)}>Subir trabajo</Button>} />

      <div className="flex gap-2 mb-4 flex-wrap">
        {["todos", ...camarasDisponibles].map(c => (
          <button key={c} onClick={() => setFiltro(c)}
            className={`btn text-xs ${filtro === c ? "btn-primary" : "btn-ghost"}`}>
            {c === "todos" ? "Todos" : TRABAJO_LABEL[c as Camara] + "s"}
          </button>
        ))}
      </div>

      {visibles.length === 0 ? <Card><Empty>No hay trabajos visibles para tu grado con este filtro.</Empty></Card> : (
        <div className="grid sm:grid-cols-2 gap-4">
          {visibles.map(t => {
            const color = t.camara === "aprendiz" ? "blue" : t.camara === "companero" ? "gold" : "green";
            return (
              <Card key={t.id}>
                <div className="flex items-start justify-between">
                  <span className="text-2xl">📜</span>
                  <Badge color={color}>{TRABAJO_LABEL[t.camara]} · {CAMARA_LABEL[t.camara]}</Badge>
                </div>
                <h3 className="font-semibold text-navy mt-2">{t.titulo}</h3>
                {t.descripcion && <p className="text-sm text-slate-600 mt-1">{t.descripcion}</p>}
                <div className="text-xs text-slate-400 mt-2">{getUsuario(t.usuario_id)?.nombre.split("(")[0].trim()} · {fecha(t.fecha)}</div>
                <Button variant="ghost" className="text-xs mt-3">📎 {t.archivo_nombre}</Button>
              </Card>
            );
          })}
        </div>
      )}
      {open && <Subir userId={user.id} logiaId={user.logia_id} camaras={camarasDisponibles}
        onClose={() => { setOpen(false); setTick(t => t + 1); }} />}
    </div>
  );
}

function Subir({ userId, logiaId, camaras, onClose }:
  { userId: string; logiaId: string; camaras: Camara[]; onClose: () => void }) {
  const [f, setF] = useState({ titulo: "", descripcion: "", camara: camaras[camaras.length - 1], archivo: "" });
  return (
    <Modal open onClose={onClose} title="Subir trabajo">
      <div className="space-y-3">
        <Input label="Título" value={f.titulo} onChange={e => setF(s => ({ ...s, titulo: e.target.value }))} />
        <Textarea label="Descripción (opcional)" value={f.descripcion} onChange={e => setF(s => ({ ...s, descripcion: e.target.value }))} />
        <Select label="Cámara del trabajo" value={f.camara} onChange={e => setF(s => ({ ...s, camara: e.target.value as Camara }))}>
          {camaras.map(c => <option key={c} value={c}>{TRABAJO_LABEL[c]} ({CAMARA_LABEL[c]})</option>)}
        </Select>
        <div>
          <label className="label">Archivo (PDF / Word)</label>
          <input type="file" accept=".pdf,.doc,.docx" className="input"
            onChange={e => setF(s => ({ ...s, archivo: e.target.files?.[0]?.name ?? "" }))} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={() => { if (f.titulo) { addTrabajo({ usuario_id: userId, logia_id: logiaId, titulo: f.titulo, descripcion: f.descripcion, camara: f.camara, archivo_nombre: f.archivo || "trabajo.pdf" }); onClose(); } }}>Subir</Button>
        </div>
      </div>
    </Modal>
  );
}
