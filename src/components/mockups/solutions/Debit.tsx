"use client";

import { m } from "motion/react";
import { Check } from "lucide-react";
import { PaymentCard } from "@/components/mockups/PaymentCard";
import { formatBRL } from "@/lib/format";
import { EASE_OUT as ease } from "@/lib/motion";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* 5. Cartão de débito */
export function DebitMock() {
  return (
    <div className="relative h-full">
      <m.div
        className="absolute right-6 top-4 rotate-6"
        initial={{ opacity: 0, y: 30, rotate: 12 }}
        animate={{ opacity: 1, y: 0, rotate: 6 }}
        transition={{ duration: 0.8, ease }}
      >
        <PaymentCard label="Débito" />
      </m.div>
      <m.div
        className="absolute bottom-2 left-0 w-[290px] rounded-[var(--radius-panel)] bg-marinho-950 p-5 text-white shadow-escuro"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease, delay: 0.5 }}
      >
        <div className="flex items-center gap-3">
          <m.span
            className="grid size-10 place-items-center rounded-full bg-ciano-500 text-marinho-950"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 420, damping: 18, delay: 0.9 }}
          >
            <Check className="size-5" strokeWidth={3} aria-hidden />
          </m.span>
          <div>
            <p className="font-semibold">Pagamento aprovado</p>
            <p className="text-[0.75rem] text-ardosia-300">Cartão de débito</p>
          </div>
        </div>
        <div className="mt-4 space-y-1.5 border-t border-white/10 pt-4 text-[0.75rem]">
          <p className="flex justify-between">
            <span className="text-ardosia-300">Valor</span>
            <span className="font-semibold">{formatBRL(92.4)}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-ardosia-300">Pedido</span>
            <span>0517</span>
          </p>
        </div>
      </m.div>
    </div>
  );
}
