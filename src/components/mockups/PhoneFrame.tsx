import { cn } from "@/lib/cn";

/** Moldura de celular genérica, desenhada em CSS (sem marca de fabricante). */
export function PhoneFrame({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative aspect-[9/17.6] rounded-[2.6rem] bg-marinho-950 p-[0.55rem] shadow-[0_40px_80px_-30px_rgba(13,24,42,.55),0_0_0_1px_rgba(255,255,255,.06)_inset]",
        className,
      )}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-white">
        <div className="absolute left-1/2 top-2 z-20 h-[1.35rem] w-[34%] -translate-x-1/2 rounded-full bg-marinho-950" />
        {children}
      </div>
    </div>
  );
}

export function StatusBar({ tone = "dark" }: { tone?: "dark" | "light" }) {
  return (
    <div
      className={cn(
        "flex h-10 items-end justify-between px-6 pb-1 text-[0.625rem] font-semibold",
        tone === "dark" ? "text-marinho-950" : "text-white",
      )}
      aria-hidden
    >
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h) => (
            <span key={h} className="w-[3px] rounded-sm bg-current" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 h-[9px] w-[18px] rounded-[3px] border border-current p-[1px]">
          <span className="block h-full w-3/4 rounded-[1px] bg-current" />
        </span>
      </span>
    </div>
  );
}
