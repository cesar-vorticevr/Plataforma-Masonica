import "./globals.css";
import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Plataforma Masónica · Gran Logia Restauración",
  description: "Administración integral de hermanos, salud, tesorería y comunicación.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
