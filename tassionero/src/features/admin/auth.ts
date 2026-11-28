import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

/** Sessão atual + verificação de proprietário no banco (a RLS decide de verdade). */
export async function requireOwner(location: { href: string }) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) {
    throw redirect({ to: "/admin/login", search: { redirect: location.href } });
  }
  const { data: isOwner, error } = await supabase.rpc("is_owner");
  if (error || !isOwner) {
    await supabase.auth.signOut();
    throw redirect({ to: "/admin/login", search: { redirect: location.href, negado: true } });
  }
  return { session: data.session };
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);
  return session;
}

export async function signIn(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
