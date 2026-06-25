"use client";
import { Card, PageTitle, Button } from "@/components/ui";

// Error boundary del área privada: se renderiza DENTRO del AppShell (la navegación sigue visible),
// para contener el fallo en el contenido sin tumbar toda la página.
export default function AppError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div>
      <PageTitle title="Algo salió mal" subtitle="No se pudo cargar esta sección." />
      <Card>
        <p className="text-sm text-slate-600">
          Ocurrió un error inesperado al cargar esta página. Reintenta; si el problema persiste, avisa al
          administrador de tu logia.
        </p>
        {error.digest && <p className="mt-2 text-xs text-slate-400">Ref.: {error.digest}</p>}
        <div className="mt-4"><Button onClick={reset}>Reintentar</Button></div>
      </Card>
    </div>
  );
}
