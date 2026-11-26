"use client";

import Image from "next/image";
import { m, useMotionValue, useSpring, useTransform } from "motion/react";
import { useRef } from "react";
import logoWhite from "../../../public/brand/gimopay-logo-white.png";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { cn } from "@/lib/cn";

/** Chip EMV desenhado em SVG. */
function Chip() {
  return (
    <svg viewBox="0 0 48 38" className="h-[30px] w-[38px]" aria-hidden>
      <defs>
        <linearGradient id="chip-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f3dcae" />
          <stop offset="0.5" stopColor="#c9a46a" />
          <stop offset="1" stopColor="#e8cf9c" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="47" height="37" rx="7" fill="url(#chip-gold)" stroke="#a8844e" strokeOpacity=".5" />
      <g fill="none" stroke="#8a6a3a" strokeOpacity=".55" strokeWidth="1.1">
        <path d="M0.5 13h14M0.5 25h14M33.5 13h14M33.5 25h14" />
        <path d="M14.5 0.5v12.5c0 3 2 4 4 4h11c2 0 4-1 4-4V0.5M14.5 37.5V25c0-3 2-4 4-4h11c2 0 4 1 4 4v12.5" />
      </g>
    </svg>
  );
}

/** Símbolo de pagamento por aproximação. */
function Contactless() {
  return (
    <svg viewBox="0 0 24 28" className="h-[22px] w-[19px]" fill="none" aria-hidden>
      {[5, 10, 15, 20].map((x, i) => (
        <path
          key={x}
          d={`M${x} ${8 - i * 2}c${2 + i} ${3 + i} ${2 + i} ${9 + i * 1.5} 0 ${12 + i * 4}`}
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity={1 - i * 0.12}
        />
      ))}
    </svg>
  );
}

/**
 * Cartão demonstrativo GIMO Pay: inclinação 3D que segue o ponteiro,
 * reflexo de luz atravessando e flutuação suave.
 */
export function PaymentCard({ label, className }: { label: "Crédito" | "Débito"; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const rotateY = useSpring(useTransform(px, [0, 1], [-14, 14]), { stiffness: 180, damping: 18 });
  const rotateX = useSpring(useTransform(py, [0, 1], [10, -10]), { stiffness: 180, damping: 18 });
  const glareX = useTransform(px, [0, 1], ["0%", "100%"]);

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== "mouse" || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    px.set((e.clientX - r.left) / r.width);
    py.set((e.clientY - r.top) / r.height);
  };
  const onLeave = () => {
    px.set(0.5);
    py.set(0.5);
  };

  return (
    <div className={cn("[perspective:1000px]", className)}>
      <m.div
        animate={reduce ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <m.div
          ref={ref}
          onPointerMove={onMove}
          onPointerLeave={onLeave}
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[1.586] w-[336px] overflow-hidden rounded-[18px] bg-[linear-gradient(135deg,#0b3a73_0%,#0a2147_45%,#0d182a_100%)] shadow-[0_40px_70px_-28px_rgba(3,60,120,.75),0_0_0_1px_rgba(255,255,255,.08)_inset]"
        >
          {/* Curvas de luz em ciano */}
          <svg viewBox="0 0 300 189" className="absolute inset-0 size-full" aria-hidden>
            <defs>
              <linearGradient id="pc-top" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#13c3ee" stopOpacity=".95" />
                <stop offset="1" stopColor="#02aad7" stopOpacity="0" />
              </linearGradient>
              <linearGradient id="pc-bottom" x1="1" y1="1" x2="0" y2="0">
                <stop offset="0" stopColor="#18c9f2" stopOpacity=".9" />
                <stop offset="1" stopColor="#02aad7" stopOpacity="0" />
              </linearGradient>
            </defs>
            <path d="M0 0h150C110 20 60 40 0 78Z" fill="url(#pc-top)" opacity=".75" />
            <path d="M300 189H170c50-12 95-44 130-92Z" fill="url(#pc-bottom)" opacity=".7" />
            <path d="M-10 150C70 110 150 40 190 -10" stroke="#3fd2f5" strokeOpacity=".35" strokeWidth="1" fill="none" />
            <path d="M200 200C240 160 280 110 310 70" stroke="#3fd2f5" strokeOpacity=".35" strokeWidth="1" fill="none" />
          </svg>

          {/* Reflexo que acompanha o ponteiro */}
          <m.div
            aria-hidden
            className="pointer-events-none absolute -inset-y-6 w-24 -translate-x-1/2 rotate-[18deg] bg-gradient-to-r from-transparent via-white/15 to-transparent"
            style={reduce ? { left: "30%" } : { left: glareX }}
          />
          {/* Varredura de luz periódica */}
          {!reduce && (
            <m.div
              aria-hidden
              className="pointer-events-none absolute -inset-y-8 w-16 rotate-[18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent"
              initial={{ left: "-30%" }}
              animate={{ left: "130%" }}
              transition={{ duration: 1.4, repeat: Infinity, repeatDelay: 3.2, ease: [0.45, 0, 0.55, 1] }}
            />
          )}

          <span className="absolute right-4 top-3.5 text-[0.625rem] font-medium tracking-[0.08em] text-white/70">
            {label}
          </span>

          <div className="absolute left-5 top-[38%] flex items-center gap-3" style={{ transform: "translateZ(20px)" }}>
            <Chip />
            <Contactless />
          </div>

          <div className="absolute right-4 top-[33%] w-[124px]" style={{ transform: "translateZ(30px)" }}>
            <Image src={logoWhite} alt="" sizes="124px" className="h-auto w-full" />
          </div>

          <p className="absolute bottom-4 left-5 text-[0.75rem] font-medium tracking-[0.16em] text-white/90">
            CLIENTE EXEMPLO
          </p>
        </m.div>
      </m.div>
    </div>
  );
}
