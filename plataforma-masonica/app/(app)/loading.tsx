// Estado de carga del área privada (dentro del AppShell) mientras las server pages obtienen datos.
// Esqueleto sobrio que insinúa el patrón título + rejilla de tarjetas. Respeta reduce-motion.
export default function Loading() {
  return (
    <div className="animate-pulse motion-reduce:animate-none" aria-busy="true" aria-label="Cargando">
      <div className="h-7 w-48 rounded bg-slate-200" />
      <div className="mt-2 h-4 w-72 max-w-full rounded bg-slate-100" />
      <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-28 rounded-xl border border-slate-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
