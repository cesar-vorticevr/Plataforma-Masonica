import Link from "next/link";

export default function Privacidad() {
  return (
    <div className="max-w-3xl mx-auto p-8 prose-sm">
      <Link href="/login" className="text-royal text-sm">← Volver</Link>
      <h1 className="text-2xl font-bold text-navy mt-4">Aviso de Privacidad</h1>
      <p className="text-slate-600 mt-3 text-sm leading-relaxed">
        La Muy Respetable Gran Logia de Estado “Restauración” (el “Responsable”) recaba y trata
        sus datos personales conforme a la Ley Federal de Protección de Datos Personales en Posesión
        de los Particulares vigente. Los datos de salud se consideran <b>datos personales sensibles</b> y
        se tratan únicamente con su <b>consentimiento expreso</b>.
      </p>
      <h2 className="text-lg font-semibold text-navy mt-5">Finalidades</h2>
      <p className="text-slate-600 text-sm">Administración del padrón de hermanos, evaluación preventiva de salud,
        control de cápitas y asistencia, comunicación institucional y directorio profesional interno.</p>
      <h2 className="text-lg font-semibold text-navy mt-5">Datos sensibles</h2>
      <p className="text-slate-600 text-sm">El cuestionario de salud es orientativo y <b>no constituye un diagnóstico médico</b>.
        Sus resultados individuales solo son visibles para usted; los administradores solo acceden a estadísticas agregadas y anonimizadas.</p>
      <h2 className="text-lg font-semibold text-navy mt-5">Derechos ARCO</h2>
      <p className="text-slate-600 text-sm">Usted puede ejercer sus derechos de Acceso, Rectificación, Cancelación y Oposición,
        así como revocar su consentimiento, escribiendo a granlogia@restauracion.org.mx.</p>
      <p className="text-slate-400 text-xs mt-6">
        [Texto modelo. Debe ser revisado y completado por un abogado antes de su uso en producción.]
      </p>
    </div>
  );
}
