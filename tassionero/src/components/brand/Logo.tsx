import { cn } from "@/lib/cn";

/**
 * Wordmark provisório recriado a partir da identidade (silhueta + TASSIONERO itálico + traço vermelho).
 * Substituir pelo arquivo vetorial oficial quando o proprietário enviar (public/brand/logo.svg).
 */
export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col leading-none select-none", className)} aria-label="Tassionero Estética Automotiva">
      <svg viewBox="0 0 220 26" className="mb-0.5 h-[0.55em] w-auto overflow-visible" aria-hidden>
        <path d="M6 22 C40 14 70 12 98 11 C112 4 130 1 150 1 C172 1 190 8 206 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M18 24 C80 21 150 21 214 18" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span className="relative font-black italic tracking-[-0.02em] text-[1em]">
        <span className="absolute -top-[0.04em] left-[-0.06em] h-[0.18em] w-[0.62em] -skew-x-[18deg] bg-racing-500" aria-hidden />
        TASSIONERO
      </span>
      {compact ? null : (
        <span className="mt-[0.28em] flex items-center gap-[0.35em] text-[0.27em] font-medium tracking-[0.42em] text-steel-300">
          <span className="h-px w-[1.6em] bg-racing-500" aria-hidden />
          ESTÉTICA AUTOMOTIVA
          <span className="h-px w-[1.6em] bg-racing-500" aria-hidden />
        </span>
      )}
    </span>
  );
}
