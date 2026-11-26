"use client";

import { m } from "motion/react";
import { ArrowDownToLine } from "lucide-react";
import { cn } from "@/lib/cn";
import { EASE_OUT as ease } from "@/lib/motion";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* 6. Antecipação de recebíveis */
export function AdvanceMock() {
  const bars = [
    { d: "05/12", v: 42 },
    { d: "12/12", v: 68 },
    { d: "19/12", v: 55 },
    { d: "26/12", v: 80 },
    { d: "02/01", v: 47 },
    { d: "09/01", v: 62 },
  ];
  return (
    <div className="relative h-full">
      <div className="absolute inset-x-0 top-0 rounded-[var(--radius-panel)] bg-white p-5 shadow-painel">
        <div className="flex items-center justify-between">
          <p className="text-[0.8125rem] font-semibold text-marinho-950">Recebimentos previstos</p>
          <span className="flex items-center gap-1.5 text-[0.6875rem] text-ardosia-500">
            <span className="size-2 rounded-sm bg-ciano-500" /> Selecionados
          </span>
        </div>
        <div className="mt-5 flex h-40 items-end gap-3">
          {bars.map((b, i) => (
            <div key={b.d} className="flex flex-1 flex-col items-center gap-2">
              <m.div
                className={cn("w-full origin-bottom rounded-t-md", i < 3 ? "bg-ciano-500" : "bg-ardosia-200")}
                style={{ height: `${b.v}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ duration: 0.8, ease, delay: 0.08 * i }}
              />
              <span className="text-[0.625rem] text-ardosia-500">{b.d}</span>
            </div>
          ))}
        </div>
      </div>
      <m.div
        className="absolute bottom-0 right-6 w-[290px] rounded-[var(--radius-panel)] bg-marinho-950 p-5 text-white shadow-escuro"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.5 }}
      >
        <p className="flex items-center gap-2 text-[0.75rem] text-ardosia-300">
          <ArrowDownToLine className="size-4 text-ciano-500" aria-hidden /> Antecipação
        </p>
        <p className="mt-1 text-[1.375rem] font-bold tracking-[-0.03em]">3 recebimentos</p>
        <p className="mt-3 rounded-xl bg-ciano-500 py-2.5 text-center text-[0.75rem] font-semibold text-marinho-950">
          Antecipar recebimentos
        </p>
        <p className="mt-2 text-[0.625rem] text-ardosia-300">Conforme as condições disponíveis.</p>
      </m.div>
    </div>
  );
}
