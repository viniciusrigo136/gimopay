"use client";

import { m, useMotionValueEvent, useScroll, useTransform, type MotionValue } from "motion/react";
import { Children, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Carrossel de deslizar (mobile): rolagem nativa com snap, o cartão em foco
 * ganha escala/opacidade e um indicador mostra a posição.
 */
export function SwipeDeck({
  children,
  label,
  className,
  itemClassName,
  tone = "light",
}: {
  children: React.ReactNode;
  label: string;
  className?: string;
  itemClassName?: string;
  tone?: "light" | "dark";
}) {
  const items = Children.toArray(children);
  const n = items.length;
  const ref = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: ref });
  const [active, setActive] = useState(0);
  useMotionValueEvent(scrollXProgress, "change", (v) => setActive(Math.round(v * (n - 1))));

  const goTo = (i: number) => {
    const el = ref.current?.children[i] as HTMLElement | undefined;
    if (el && ref.current) ref.current.scrollTo({ left: el.offsetLeft - 20, behavior: "smooth" });
  };

  return (
    <div className={className}>
      <m.div
        ref={ref}
        role="region"
        aria-roledescription="carrossel"
        aria-label={label}
        className="-mx-5 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-3 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        initial={{ opacity: 0, x: 60 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {items.map((child, i) => (
          <DeckItem key={i} index={i} count={n} progress={scrollXProgress} className={itemClassName}>
            {child}
          </DeckItem>
        ))}
        <span aria-hidden className="w-2 shrink-0" />
      </m.div>
      <div className="mt-4 flex items-center gap-1.5" aria-hidden>
        {items.map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => goTo(i)}
            className="grid h-6 place-items-center"
          >
            <m.span
              className={cn(
                "block h-1.5 rounded-full",
                i === active ? "bg-ciano-500" : tone === "dark" ? "bg-white/20" : "bg-ardosia-200",
              )}
              animate={{ width: i === active ? 22 : 6 }}
              transition={{ type: "spring", stiffness: 420, damping: 30 }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

function DeckItem({
  children,
  index,
  count,
  progress,
  className,
}: {
  children: React.ReactNode;
  index: number;
  count: number;
  progress: MotionValue<number>;
  className?: string;
}) {
  const center = count > 1 ? index / (count - 1) : 0;
  const span = count > 1 ? 1 / (count - 1) : 1;
  // Faixas sempre dentro de [0, 1] e crescentes (exigência das animações por rolagem).
  const input = [center - span, center, center + span].filter((v) => v >= 0 && v <= 1);
  const at = (edge: number, mid: number) => input.map((v) => (v === center ? mid : edge));
  const scale = useTransform(progress, input, at(0.93, 1));
  const opacity = useTransform(progress, input, at(0.55, 1));
  return (
    <m.div style={{ scale, opacity }} className={cn("w-[84%] max-w-[22rem] shrink-0 snap-start", className)}>
      {children}
    </m.div>
  );
}
