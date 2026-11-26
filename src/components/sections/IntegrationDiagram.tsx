"use client";

import { m, useInView, } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useRef } from "react";

type Node = { label: string; x: number; y: number };
type Layout = {
  w: number;
  h: number;
  pill: { w: number; h: number; font: number };
  hub: { x: number; y: number; size: number };
  sources: Node[]; // x,y = canto superior esquerdo do rótulo
  methods: Node[];
  inPath: (n: Node, i: number) => string;
  outPath: (n: Node, i: number) => string;
};

const sourcesLabels = ["Plataformas digitais", "Sistemas de gestão", "Modelos de negócio"];
const methodsLabels = ["Pix", "Cartão de crédito", "Cartão de débito"];

const horizontal: Layout = {
  w: 720,
  h: 440,
  pill: { w: 212, h: 48, font: 15 },
  hub: { x: 360, y: 220, size: 104 },
  sources: sourcesLabels.map((label, i) => ({ label, x: 4, y: 42 + i * 130 })),
  methods: methodsLabels.map((label, i) => ({ label, x: 504, y: 86 + i * 110 })),
  inPath: (n) => {
    const y = n.y + 24;
    return `M${n.x + 212} ${y} C ${n.x + 270} ${y}, 250 220, 308 220`;
  },
  outPath: (n) => {
    const y = n.y + 24;
    return `M412 220 C 460 220, 450 ${y}, ${n.x} ${y}`;
  },
};

const vertical: Layout = {
  w: 340,
  h: 600,
  pill: { w: 178, h: 42, font: 12.5 },
  hub: { x: 170, y: 300, size: 88 },
  sources: sourcesLabels.map((label, i) => ({ label, x: 2, y: 14 + i * 64 })),
  methods: methodsLabels.map((label, i) => ({ label, x: 160, y: 416 + i * 64 })),
  inPath: (n, i) => {
    const y = n.y + 21;
    const hx = 148 + i * 22;
    return `M${n.x + 178} ${y} C ${250 - i * 14} ${y}, ${hx} ${y + 30}, ${hx} 258`;
  },
  outPath: (n, i) => {
    const y = n.y + 21;
    const hx = 148 + i * 22;
    return `M${hx} 342 C ${hx} ${y - 30}, ${90 + i * 10} ${y}, ${n.x} ${y}`;
  },
};

const ease = [0.65, 0, 0.35, 1] as const;

function Diagram({ layout, className }: { layout: Layout; className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.35 });
  const reduce = usePrefersReducedMotion();
  const { pill, hub } = layout;
  const half = hub.size / 2;

  const paths = [
    ...layout.sources.map((n, i) => ({ d: layout.inPath(n, i), key: `in-${i}`, order: i })),
    ...layout.methods.map((n, i) => ({ d: layout.outPath(n, i), key: `out-${i}`, order: 3 + i })),
  ];

  const pillEl = (n: Node, i: number, side: "src" | "out") => (
    <m.g
      key={`${side}-${n.label}`}
      initial={{ opacity: 0, x: side === "src" ? -14 : 14 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.7, delay: (side === "src" ? 0 : 1.1) + i * 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <rect
        x={n.x}
        y={n.y}
        width={pill.w}
        height={pill.h}
        rx={pill.h / 2}
        fill="#fff"
        stroke={side === "out" ? "var(--color-ciano-500)" : "var(--color-ardosia-200)"}
        strokeWidth={side === "out" ? 1.5 : 1}
      />
      <circle
        cx={n.x + 20}
        cy={n.y + pill.h / 2}
        r={4.5}
        fill={side === "out" ? "var(--color-ciano-500)" : "var(--color-marinho-800)"}
      />
      <text
        x={n.x + 34}
        y={n.y + pill.h / 2}
        dominantBaseline="central"
        fontSize={pill.font}
        fontWeight={500}
        fill="var(--color-marinho-950)"
      >
        {n.label}
      </text>
    </m.g>
  );

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${layout.w} ${layout.h}`}
      className={className}
      role="img"
      aria-label="Diagrama ilustrativo: plataformas digitais, sistemas de gestão e modelos de negócio conectados à GIMO Pay, que conecta Pix, cartão de crédito e cartão de débito."
      style={{ fontFamily: "var(--font-sans)" }}
    >
      {paths.map((p) => (
        <g key={p.key}>
          <path d={p.d} fill="none" stroke="var(--color-ardosia-200)" strokeWidth={1.5} />
          <m.path
            d={p.d}
            fill="none"
            stroke="var(--color-ciano-500)"
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={inView ? { pathLength: 1 } : {}}
            transition={{ duration: 0.9, delay: 0.3 + p.order * 0.12, ease }}
          />
          {!reduce && inView && (
            <circle r={4} fill="var(--color-ciano-500)">
              <animateMotion
                dur={`${2.4 + (p.order % 3) * 0.35}s`}
                begin={`${1.8 + p.order * 0.25}s`}
                repeatCount="indefinite"
                path={p.d}
                keyPoints="0;1"
                keyTimes="0;1"
                calcMode="spline"
                keySplines="0.45 0 0.55 1"
              />
              <animate attributeName="opacity" values="0;1;1;0" dur={`${2.4 + (p.order % 3) * 0.35}s`} begin={`${1.8 + p.order * 0.25}s`} repeatCount="indefinite" />
            </circle>
          )}
        </g>
      ))}

      {layout.sources.map((n, i) => pillEl(n, i, "src"))}
      {layout.methods.map((n, i) => pillEl(n, i, "out"))}

      {/* Hub GIMO Pay */}
      <m.g
        style={{ transformOrigin: `${hub.x}px ${hub.y}px`, transformBox: "view-box" }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.85 }}
      >
        {!reduce &&
          [0, 1].map((i) => (
            <circle key={i} cx={hub.x} cy={hub.y} r={half} fill="none" stroke="var(--color-ciano-500)" strokeWidth={1.5}>
              <animate attributeName="r" values={`${half};${half * 1.9}`} dur="2.8s" begin={`${2 + i * 1.4}s`} repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.5;0" dur="2.8s" begin={`${2 + i * 1.4}s`} repeatCount="indefinite" />
            </circle>
          ))}
        <image
          href="/brand/gimopay-icon.png"
          x={hub.x - half}
          y={hub.y - half}
          width={hub.size}
          height={hub.size}
        />
      </m.g>
    </svg>
  );
}

export function IntegrationDiagram() {
  return (
    <>
      <Diagram layout={horizontal} className="hidden h-auto w-full sm:block" />
      <Diagram layout={vertical} className="mx-auto h-auto w-full max-w-[380px] sm:hidden" />
    </>
  );
}
