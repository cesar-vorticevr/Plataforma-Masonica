import type { Metadata } from "next";
import LoginForm from "./LoginForm";

export const metadata: Metadata = { title: "Iniciar sesión · Plataforma Masónica" };

// Server Component (shell): la interactividad vive en la isla LoginForm.
export default function LoginPage() {
  return <LoginForm />;
}
