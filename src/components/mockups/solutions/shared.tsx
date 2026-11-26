"use client";

import { Check, Clock3 } from "lucide-react";
import { cn } from "@/lib/cn";
import { EASE_OUT as ease } from "@/lib/motion";

/*
 * Peças compartilhadas pelos mockups de soluções. Todos os nomes, valores e
 * datas dos mockups são fictícios e não representam o sistema real da GIMO Pay.
 */

export const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
export const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

export function Window({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-panel)] bg-white shadow-painel",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-ardosia-200 bg-nevoa px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-ardosia-200" />
          ))}
        </span>
        <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[0.6875rem] text-ardosia-500 ring-1 ring-ardosia-200">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

export function StatusPill({ status }: { status: "Aprovado" | "Pendente" | "Recebido" }) {
  const ok = status !== "Pendente";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold",
        ok ? "bg-emerald-50 text-sucesso" : "bg-amber-50 text-amber-700",
      )}
    >
      {ok ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <Clock3 className="size-3" aria-hidden />}
      {status}
    </span>
  );
}
