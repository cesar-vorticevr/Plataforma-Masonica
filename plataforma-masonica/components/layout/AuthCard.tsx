"use client";
import React from "react";
export default function AuthCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-center bg-navy text-white p-12">
        <div className="text-gold text-sm font-semibold tracking-widest">M.·.R.·.G.·.L.·.E.·.</div>
        <h1 className="text-4xl font-bold mt-3 leading-tight">Gran Logia de Estado<br/>“Restauración”</h1>
        <p className="text-white/70 mt-4 max-w-md">Plataforma Masónica Integral. Administración de hermanos, salud preventiva, tesorería, asistencia y comunicación interlogial.</p>
        <p className="text-white/40 mt-8 text-sm italic">Por la Unidad y el Progreso</p>
      </div>
      <div className="flex items-center justify-center p-6 bg-slate-50">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
