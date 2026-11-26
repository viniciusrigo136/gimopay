import { cn } from "@/lib/cn";

/** Selo obrigatório em todo mockup: deixa claro que não é um sistema real. */
export function IllustrativeBadge({
  className,
  tone = "light",
}: {
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-medium leading-none",
        tone === "light"
          ? "bg-white/90 text-ardosia-500 ring-1 ring-ardosia-200"
          : "bg-white/8 text-ardosia-300 ring-1 ring-white/15",
        className,
      )}
    >
      <svg viewBox="0 0 12 12" className="size-3" aria-hidden>
        <circle cx="6" cy="6" r="5" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <path d="M6 5.3v3M6 3.4v.1" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      Interface ilustrativa
    </span>
  );
}
