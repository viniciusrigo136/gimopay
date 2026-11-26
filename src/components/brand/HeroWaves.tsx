import { cn } from "@/lib/cn";

/**
 * Arcos do símbolo GIMO Pay emitidos continuamente, como um sinal de
 * pagamento por aproximação. Só CSS (transform/opacity): leve no mobile.
 */
export function HeroWaves({ className }: { className?: string }) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute", className)}>
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          viewBox="0 0 120 240"
          fill="none"
          className="wave-emit absolute left-0 top-0 h-full w-auto"
          style={{ animationDelay: `${i * 1.4}s` }}
        >
          <path d="M14 20a160 160 0 0 1 0 200" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
          <path d="M52 40a120 120 0 0 1 0 160" stroke="currentColor" strokeWidth="10" strokeLinecap="round" opacity=".55" />
        </svg>
      ))}
    </div>
  );
}
