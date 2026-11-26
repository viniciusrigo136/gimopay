"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";
import { PaymentCard } from "@/components/mockups/PaymentCard";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";
import { EASE_OUT as ease } from "@/lib/motion";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* 4. Cartão de crédito */
export function CreditMock() {
  const [mode, setMode] = useState<"vista" | "parcelado">("vista");
  useEffect(() => {
    const t = window.setTimeout(() => setMode("parcelado"), 1300);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative h-full">
      <m.div
        className="absolute left-4 top-6 -rotate-6"
        initial={{ opacity: 0, y: 30, rotate: -12 }}
        animate={{ opacity: 1, y: 0, rotate: -6 }}
        transition={{ duration: 0.8, ease }}
      >
        <PaymentCard label="Crédito" />
      </m.div>
      <div className="absolute bottom-0 right-0 w-[300px] rounded-[var(--radius-panel)] bg-white p-5 shadow-painel">
        <p className="text-[0.75rem] font-semibold text-marinho-950">Condição de pagamento</p>
        <div className="relative mt-3 grid grid-cols-2 rounded-xl bg-nevoa p-1 text-[0.75rem] font-semibold">
          {(["vista", "parcelado"] as const).map((k) => (
            <span key={k} className={cn("relative z-10 py-2 text-center", mode === k ? "text-marinho-950" : "text-ardosia-500")}>
              {mode === k && (
                <m.span
                  layoutId="credit-mode"
                  className="absolute inset-0 -z-10 rounded-lg bg-white shadow-sm ring-1 ring-ardosia-200"
                  transition={{ type: "spring", stiffness: 400, damping: 32 }}
                />
              )}
              {k === "vista" ? "À vista" : "Parcelado"}
            </span>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between rounded-xl px-3 py-2.5 text-[0.75rem] ring-1 ring-ardosia-200">
          <span className="text-ardosia-500">Parcelas</span>
          <m.span key={mode} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="font-semibold text-marinho-950">
            {mode === "vista" ? "1x" : "3x"}
          </m.span>
        </div>
        <p className="mt-3 flex justify-between text-[0.75rem]">
          <span className="text-ardosia-500">Total</span>
          <span className="font-semibold text-marinho-950">{formatBRL(870)}</span>
        </p>
        <p className="mt-3 rounded-xl bg-ciano-500 py-2.5 text-center text-[0.75rem] font-semibold text-marinho-950">
          Pagar
        </p>
      </div>
    </div>
  );
}
