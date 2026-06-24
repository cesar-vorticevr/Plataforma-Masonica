// Lógica pura de cápitas (sin dependencia de datos): qué meses aplican y cumplimiento.
// El inicio es fecha_inicio; si no hay, fecha_registro.

export interface RangoCapitas { iniMes: number; finMes: number; count: number }

export function rangoCapitas(
  fechaInicio: string | null | undefined,
  fechaRegistro: string,
  anio: number,
  hoy: Date = new Date(),
): RangoCapitas {
  const finMes = anio === hoy.getFullYear() ? hoy.getMonth() + 1 : 12;
  const inicio = new Date(fechaInicio ?? fechaRegistro);
  if (inicio.getFullYear() > anio) return { iniMes: 0, finMes, count: 0 }; // aún no iniciaba
  const iniMes = inicio.getFullYear() === anio ? inicio.getMonth() + 1 : 1;
  if (iniMes > finMes) return { iniMes, finMes, count: 0 };
  return { iniMes, finMes, count: finMes - iniMes + 1 };
}

export function mesAplica(r: RangoCapitas, mes: number): boolean {
  return r.count > 0 && mes >= r.iniMes && mes <= r.finMes;
}

export interface CumplimientoPago { mes: number; pagado: boolean }
export interface Cumplimiento extends RangoCapitas { pagados: number; pendientes: number; pct: number }

export function cumplimiento(r: RangoCapitas, pagos: CumplimientoPago[]): Cumplimiento {
  if (r.count === 0) return { ...r, pagados: 0, pendientes: 0, pct: 0 };
  const pagados = pagos.filter(p => p.pagado && p.mes >= r.iniMes && p.mes <= r.finMes).length;
  return { ...r, pagados, pendientes: r.count - pagados, pct: Math.round((pagados / r.count) * 100) };
}
