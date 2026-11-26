"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

/**
 * Renderiza uma composição em tamanho fixo de projeto e a reduz
 * proporcionalmente quando o espaço disponível é menor (mockups no mobile).
 */
export function ScaleToFit({
  width,
  height,
  children,
  className,
}: {
  width: number;
  height: number;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setScale(Math.min(1, entry.contentRect.width / width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width]);

  const s = scale ?? 1;
  return (
    <div
      ref={ref}
      className={cn("relative mx-auto w-full", className)}
      style={{ maxWidth: width, height: height * s, visibility: scale === null ? "hidden" : undefined }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left"
        style={{ width, height, transform: `scale(${s})` }}
      >
        {children}
      </div>
    </div>
  );
}
