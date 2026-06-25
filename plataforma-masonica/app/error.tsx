"use client";
import Link from "next/link";

// Error boundary global (Next exige Client Component). Pantalla completa, sobria, con reintento.
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="min-h-screen grid place-items-center bg-[#f4f6fb] px-6">
      <div className="w-full max-w-md text-center">
        <div className="text-gold text-sm font-semibold tracking-widest">M.·.R.·.G.·.L.·.E.·.</div>
        <h1 className="mt-5 text-xl font-semibold text-slate-800">Algo salió mal</h1>
        <p className="mt-2 text-sm text-slate-500">
          Ocurrió un error inesperado. Puedes reintentar; si persiste, contacta al administrador de tu logia.
        </p>
        {error.digest && <p className="mt-2 text-xs text-slate-400">Ref.: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={reset} className="btn btn-primary">Reintentar</button>
          <Link href="/" className="btn btn-ghost">Ir al inicio</Link>
        </div>
      </div>
    </div>
  );
}
