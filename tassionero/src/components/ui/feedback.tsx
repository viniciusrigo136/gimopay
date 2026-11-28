import type { ReactNode } from "react";
import { AlertTriangle, Inbox, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/cn";
import { errorMessage } from "@/domain/errors";
import { Button } from "./Button";

export function Spinner({ className, label = "Carregando" }: { className?: string; label?: string }) {
  return (
    <span role="status" className={cn("inline-flex items-center gap-2 text-sm text-steel-400", className)}>
      <Loader2 className="size-4 animate-spin" aria-hidden />
      <span>{label}…</span>
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}

export function EmptyState({ title, children, action, icon }: { title: string; children?: ReactNode; action?: ReactNode; icon?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-panel border border-dashed border-graphite-600 px-6 py-12 text-center">
      <span className="grid size-12 place-items-center rounded-full bg-graphite-700 text-steel-400">{icon ?? <Inbox className="size-5" />}</span>
      <p className="font-semibold text-pearl">{title}</p>
      {children ? <div className="max-w-md text-sm text-steel-400">{children}</div> : null}
      {action}
    </div>
  );
}

export function ErrorState({ error, onRetry, className }: { error: unknown; onRetry?: () => void; className?: string }) {
  return (
    <div role="alert" className={cn("flex flex-col items-center gap-3 rounded-panel bg-danger/5 px-6 py-10 text-center ring-1 ring-danger/30", className)}>
      <AlertTriangle className="size-6 text-danger" aria-hidden />
      <p className="text-sm text-steel-200">{errorMessage(error)}</p>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RotateCcw className="size-4" aria-hidden /> Tentar de novo
        </Button>
      ) : null}
    </div>
  );
}

export function InlineError({ children }: { children?: ReactNode }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-1.5 text-xs font-medium text-danger">
      {children}
    </p>
  );
}

export function Notice({ tone = "info", children, className }: { tone?: "info" | "warn" | "ok"; children: ReactNode; className?: string }) {
  const tones = {
    info: "bg-white/[0.03] ring-graphite-600 text-steel-300",
    warn: "bg-warn/10 ring-warn/30 text-steel-200",
    ok: "bg-ok/10 ring-ok/30 text-steel-200",
  } as const;
  return <div className={cn("rounded-control px-4 py-3 text-sm ring-1", tones[tone], className)}>{children}</div>;
}
