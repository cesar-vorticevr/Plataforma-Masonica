"use client";
import React from "react";
import { Semaforo } from "@/lib/types";

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`card p-5 ${className}`}>{children}</div>;
}
export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">{title}</h1>
        {subtitle && <p className="text-slate-500 mt-1 text-sm">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
export function Button({ children, variant = "primary", className = "", ...p }:
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "gold" }) {
  const v = variant === "ghost" ? "btn-ghost" : variant === "gold" ? "btn-gold" : "btn-primary";
  return <button className={`btn ${v} ${className}`} {...p}>{children}</button>;
}
export function Input({ label, ...p }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div>{label && <label className="label">{label}</label>}<input className="input" {...p} /></div>
  );
}
export function Textarea({ label, ...p }: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (<div>{label && <label className="label">{label}</label>}<textarea className="input min-h-[90px]" {...p} /></div>);
}
export function Select({ label, children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (<div>{label && <label className="label">{label}</label>}<select className="input" {...p}>{children}</select></div>);
}
export function Badge({ children, color = "slate" }: { children: React.ReactNode; color?: string }) {
  const map: Record<string,string> = {
    slate: "bg-slate-100 text-slate-700", green: "bg-emerald-100 text-emerald-700",
    yellow: "bg-amber-100 text-amber-700", red: "bg-rose-100 text-rose-700",
    blue: "bg-blue-100 text-blue-700", gold: "bg-amber-100 text-amber-800",
  };
  return <span className={`badge ${map[color] ?? map.slate}`}>{children}</span>;
}
export function SemaforoBadge({ s }: { s: Semaforo }) {
  const c = s === "verde" ? "green" : s === "amarillo" ? "yellow" : "red";
  const label = s === "verde" ? "Verde" : s === "amarillo" ? "Amarillo" : "Rojo";
  return <Badge color={c}>● {label}</Badge>;
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-center text-slate-400 py-10 text-sm">{children}</div>;
}
export function Stat({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <Card>
      <div className="text-slate-500 text-sm">{label}</div>
      <div className="text-2xl font-bold text-navy mt-1">{value}</div>
      {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
    </Card>
  );
}
export function Modal({ open, onClose, title, children }:
  { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-navy">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
