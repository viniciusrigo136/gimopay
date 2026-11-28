import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Lock } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Notice } from "@/components/ui/feedback";
import { Field, Input } from "@/components/ui/fields";
import { signIn } from "@/features/admin/auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  validateSearch: z.object({ redirect: z.string().optional(), negado: z.boolean().optional() }),
  head: () => ({ meta: [{ title: "Entrar | Painel Tassionero" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

const schema = z.object({
  email: z.string().trim().email("Informe um e-mail válido."),
  password: z.string().min(6, "Informe a senha."),
});

function LoginPage() {
  const { redirect: to, negado } = Route.useSearch();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(negado ? "Esta conta não tem acesso ao painel." : null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "", password: "" } });

  const onSubmit = form.handleSubmit(async (v) => {
    setError(null);
    try {
      await signIn(v.email, v.password);
      const { data: isOwner } = await supabase.rpc("is_owner");
      if (!isOwner) {
        await supabase.auth.signOut();
        setError("Esta conta não tem acesso ao painel.");
        return;
      }
      await navigate({ to: to && to.startsWith("/admin") ? to : "/admin" });
    } catch {
      setError("E-mail ou senha incorretos.");
    }
  });

  return (
    <main className="relative grid min-h-dvh place-items-center overflow-hidden bg-carbon px-4">
      <span className="light-tube absolute top-[18%] left-[-5%] h-[3px] w-[40%] rotate-[10deg] opacity-60" aria-hidden />
      <span className="light-tube absolute top-[18%] right-[-5%] h-[3px] w-[40%] -rotate-[10deg] opacity-60" aria-hidden />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center text-[34px]">
          <Logo />
        </div>
        <form onSubmit={onSubmit} noValidate className="panel space-y-5 p-6">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-racing-400" aria-hidden />
            <h1 className="font-bold">Área do proprietário</h1>
          </div>
          {error ? <Notice tone="warn">{error}</Notice> : null}
          <Field label="E-mail" htmlFor="email" error={form.formState.errors.email?.message}>
            <Input id="email" type="email" autoComplete="username" {...form.register("email")} />
          </Field>
          <Field label="Senha" htmlFor="password" error={form.formState.errors.password?.message}>
            <Input id="password" type="password" autoComplete="current-password" {...form.register("password")} />
          </Field>
          <Button type="submit" className="w-full" loading={form.formState.isSubmitting}>
            Entrar
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-steel-500">Acesso restrito. Não há cadastro público.</p>
      </div>
    </main>
  );
}
