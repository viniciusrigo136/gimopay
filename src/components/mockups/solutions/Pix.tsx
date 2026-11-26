"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";
import { Check, Copy } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { StatusPill } from "./shared";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* Padrão de QR decorativo (não é um código válido). */
function FakeQr() {
  const cells: boolean[] = [];
  let seed = 7;
  for (let i = 0; i < 21 * 21; i++) {
    seed = (seed * 9301 + 49297) % 233280;
    cells.push(seed / 233280 > 0.52);
  }
  const finder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7);
  return (
    <svg viewBox="0 0 21 21" className="size-full" shapeRendering="crispEdges" aria-hidden>
      {cells.map((on, i) => {
        const r = Math.floor(i / 21);
        const c = i % 21;
        if (finder(r, c)) return null;
        return on ? <rect key={i} x={c} y={r} width="1" height="1" fill="var(--color-marinho-950)" /> : null;
      })}
      {[
        [0, 0],
        [14, 0],
        [0, 14],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="none" stroke="var(--color-marinho-950)">
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="var(--color-marinho-950)" />
        </g>
      ))}
    </svg>
  );
}

/* 3. Pix */
export function PixMock() {
  const [received, setReceived] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReceived(true), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative grid h-full place-items-center">
      <div className="w-[300px] rounded-[var(--radius-panel)] bg-white p-5 text-center shadow-painel">
        <p className="text-[0.75rem] font-semibold text-marinho-950">Pague com Pix</p>
        <p className="text-[1.5rem] font-bold tracking-[-0.03em] text-marinho-950">{formatBRL(64)}</p>
        <div className="relative mx-auto mt-3 size-40 rounded-xl p-2 ring-1 ring-ardosia-200">
          <FakeQr />
          {received && (
            <m.div
              className="absolute inset-0 grid place-items-center rounded-xl bg-white/90"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <m.span
                className="grid size-14 place-items-center rounded-full bg-ciano-500 text-marinho-950"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 18 }}
              >
                <Check className="size-7" strokeWidth={3} aria-hidden />
              </m.span>
            </m.div>
          )}
        </div>
        <p className="mt-3 flex items-center justify-center gap-1.5 rounded-lg py-2 text-[0.6875rem] font-semibold text-marinho-800 ring-1 ring-ardosia-200">
          <Copy className="size-3.5" aria-hidden /> Copiar código Pix
        </p>
        <div className="mt-3 flex justify-center">
          {received ? <StatusPill status="Recebido" /> : <StatusPill status="Pendente" />}
        </div>
      </div>
    </div>
  );
}
