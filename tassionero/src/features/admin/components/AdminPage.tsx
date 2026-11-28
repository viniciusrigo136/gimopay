import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export function AdminPage({ title, subtitle, actions, children }: { title: string; subtitle?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-steel-400">{subtitle}</p> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      {children}
    </div>
  );
}

export function Card({ title, actions, children, className, bodyClass }: { title?: ReactNode; actions?: ReactNode; children: ReactNode; className?: string; bodyClass?: string }) {
  return (
    <section className={cn("rounded-panel bg-graphite-800/80 ring-1 ring-white/[0.06] backdrop-blur", className)}>
      {title || actions ? (
        <header className="flex items-center justify-between gap-3 px-5 pt-4">
          {title ? <h2 className="font-bold">{title}</h2> : <span />}
          {actions}
        </header>
      ) : null}
      <div className={cn("p-5", bodyClass)}>{children}</div>
    </section>
  );
}

export function Kpi({ label, value, hint, tone = "neutral", icon }: { label: string; value: ReactNode; hint?: ReactNode; tone?: "neutral" | "good" | "warn" | "bad"; icon?: ReactNode }) {
  return (
    <div className="relative overflow-hidden rounded-panel bg-graphite-800/80 p-5 ring-1 ring-white/[0.06]">
      <div className="flex items-start justify-between gap-2">
        <p className="text-sm font-medium text-steel-400">{label}</p>
        {icon ? <span className="text-steel-500">{icon}</span> : null}
      </div>
      <p className="mt-2 text-[28px] leading-none font-extrabold tabular-nums">{value}</p>
      {hint ? (
        <p className={cn("mt-2 text-xs", tone === "good" && "text-ok", tone === "warn" && "text-warn", tone === "bad" && "text-danger", tone === "neutral" && "text-steel-500")}>{hint}</p>
      ) : null}
    </div>
  );
}

/** Abas simples (filtro de status, visões da agenda). */
export function Segmented<T extends string>({ value, onChange, options, label }: { value: T; onChange: (v: T) => void; options: { value: T; label: string }[]; label: string }) {
  return (
    <div role="group" aria-label={label} className="inline-flex flex-wrap gap-1 rounded-full bg-graphite-900 p-1 ring-1 ring-white/[0.06]">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn("rounded-full px-3.5 py-1.5 text-xs font-semibold transition", value === o.value ? "bg-pearl text-carbon" : "text-steel-400 hover:text-pearl")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
