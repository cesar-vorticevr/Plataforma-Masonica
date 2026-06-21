"use client";
import { createBrowserClient } from "@supabase/ssr";

// Cliente de navegador para Supabase.
// Se usa cuando NEXT_PUBLIC_DATA_MODE=supabase.
// El programador debe definir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

export const DATA_MODE = process.env.NEXT_PUBLIC_DATA_MODE ?? "mock";
