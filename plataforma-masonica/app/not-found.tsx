import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = { title: "Página no encontrada · Plataforma Masónica" };

// 404 institucional (fuera del AppShell): pantalla completa, sobria, conforme a DESIGN.md.
export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#f4f6fb] px-6">
      <div className="w-full max-w-md text-center">
        <div className="text-gold text-sm font-semibold tracking-widest">M.·.R.·.G.·.L.·.E.·.</div>
        <div className="mt-5 text-7xl font-bold text-navy tabular-nums leading-none">404</div>
        <h1 className="mt-4 text-xl font-semibold text-slate-800">Página no encontrada</h1>
        <p className="mt-2 text-sm text-slate-500">
          La página que buscas no existe o fue movida. Revisa la dirección o vuelve al inicio.
        </p>
        <Link href="/" className="btn btn-primary mt-6">Volver al inicio</Link>
      </div>
    </div>
  );
}
