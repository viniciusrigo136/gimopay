import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

/**
 * Cliente do backend (Lovable Cloud / Supabase).
 * Usa apenas a chave PÚBLICA (publishable/anon). Toda autorização é feita no banco (RLS + funções).
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

if (!url || !key) {
  throw new Error("Configure VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY (veja .env.example).");
}

const isBrowser = typeof window !== "undefined";

export const supabase = createClient<Database>(url, key, {
  auth: {
    // No servidor (SSR) não há sessão: páginas públicas leem só dados públicos.
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: false,
  },
});

/** URL pública de um arquivo do bucket de mídia (ou caminho local em /public). */
export function mediaUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith("/") || path.startsWith("http")) return path;
  return supabase.storage.from("media").getPublicUrl(path).data.publicUrl;
}
