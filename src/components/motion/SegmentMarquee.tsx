import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/cn";

type Item = { label: string; icon: LucideIcon; highlight?: boolean };

/** Duas faixas em movimento contínuo, em sentidos opostos (mobile). */
export function SegmentMarquee({ items }: { items: Item[] }) {
  const rows = [items.slice(0, Math.ceil(items.length / 2)), items.slice(Math.ceil(items.length / 2))];
  return (
    <div
      aria-hidden
      className="-mx-5 space-y-3 overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]"
    >
      {rows.map((row, r) => (
        <div
          key={r}
          className="marquee-track flex w-max gap-3"
          data-reverse={r === 1 ? "" : undefined}
          style={{ "--marquee-duration": `${26 + r * 6}s` } as React.CSSProperties}
        >
          {[...row, ...row, ...row, ...row].map((item, i) => {
            const Icon = item.icon;
            return (
              <span
                key={i}
                className={cn(
                  "flex shrink-0 items-center gap-2.5 rounded-full py-2.5 pl-2.5 pr-5 text-[0.9375rem] font-semibold",
                  item.highlight
                    ? "bg-marinho-950 text-white"
                    : "bg-white text-marinho-800 ring-1 ring-ardosia-200",
                )}
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full",
                    item.highlight ? "bg-ciano-500 text-marinho-950" : "bg-ciano-50 text-ciano-700",
                  )}
                >
                  <Icon className="size-4" strokeWidth={1.9} />
                </span>
                {item.label}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
