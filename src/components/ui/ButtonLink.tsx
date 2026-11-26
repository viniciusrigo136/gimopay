"use client";

import { m, useMotionValue, useSpring, } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useRef } from "react";
import { cn } from "@/lib/cn";
import { emitPrefill, type PrefillPayload } from "@/lib/prefill";

type Variant = "primary" | "secondary" | "ghost" | "onDark" | "onDarkOutline" | "ink" | "inkOutline";
type Size = "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-ciano-500 text-marinho-950 shadow-[0_1px_0_rgba(255,255,255,.35)_inset,0_10px_24px_-12px_rgba(2,170,215,.9)] hover:bg-[#13b6e2]",
  secondary:
    "bg-white text-marinho-800 ring-1 ring-inset ring-ardosia-200 hover:ring-marinho-800/40",
  ghost: "text-marinho-800 hover:bg-marinho-800/5",
  onDark: "bg-white text-marinho-950 hover:bg-ciano-50",
  onDarkOutline: "text-white ring-1 ring-inset ring-white/35 hover:ring-white/80 hover:bg-white/5",
  ink: "bg-marinho-950 text-white hover:bg-marinho-900",
  inkOutline: "text-marinho-950 ring-[1.5px] ring-inset ring-marinho-950/40 hover:ring-marinho-950 hover:bg-white/15",
};

const sizes: Record<Size, string> = {
  md: "min-h-11 px-5 py-2 text-[0.9375rem]",
  lg: "min-h-14 px-7 py-3 text-base",
};

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  magnetic?: boolean;
  prefill?: PrefillPayload;
  icon?: React.ReactNode;
  external?: boolean;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className,
  magnetic = false,
  prefill,
  icon,
  external,
  onClick,
}: Props) {
  const ref = useRef<HTMLAnchorElement>(null);
  const reduce = usePrefersReducedMotion();
  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.6 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 18, mass: 0.6 });

  const onPointerMove = (e: React.PointerEvent) => {
    if (!magnetic || reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.22);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.32);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.a
      ref={ref}
      href={href}
      onClick={(e) => {
        if (prefill) emitPrefill(prefill);
        onClick?.(e);
      }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
      style={{ x, y }}
      whileTap={{ scale: 0.97 }}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={cn(
        "group relative inline-flex select-none items-center justify-center gap-2.5 text-center leading-tight rounded-[var(--radius-control)] font-semibold tracking-[-0.01em] transition-[background-color,box-shadow,color] duration-200",
        variants[variant],
        sizes[size],
        className,
      )}
    >
      {icon}
      <span>{children}</span>
    </m.a>
  );
}
