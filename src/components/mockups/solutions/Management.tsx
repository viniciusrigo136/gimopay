"use client";

import { m } from "motion/react";
import { CreditCard, SlidersHorizontal } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { item, list, StatusPill, Window } from "./shared";
import { EASE_OUT as ease } from "@/lib/motion";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* 7. Gestão de transações */
export function ManagementMock() {
  const rows = [
    { date: "26/11 14:32", method: "Pix", value: 248.9, status: "Aprovado" as const },
    { date: "26/11 13:05", method: "Crédito 3x", value: 1290, status: "Aprovado" as const },
    { date: "26/11 11:48", method: "Link de pagamento", value: 180, status: "Pendente" as const },
    { date: "26/11 10:12", method: "Débito", value: 86.5, status: "Aprovado" as const },
    { date: "25/11 18:40", method: "Pix", value: 64, status: "Aprovado" as const },
  ];
  return (
    <Window title="painel / transações" className="h-full">
      <div className="p-4">
        <div className="grid grid-cols-3 gap-2.5">
          {[
            { k: "Recebido", v: formatBRL(4862.4) },
            { k: "A receber", v: formatBRL(2310) },
            { k: "Transações", v: "38" },
          ].map((kpi, i) => (
            <m.div
              key={kpi.k}
              className="rounded-xl bg-nevoa p-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease, delay: 0.06 * i }}
            >
              <p className="text-[0.625rem] text-ardosia-500">{kpi.k}</p>
              <p className="text-[0.9375rem] font-bold text-marinho-950 tabular-nums">{kpi.v}</p>
            </m.div>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between text-[0.6875rem]">
          <p className="font-semibold text-marinho-950">Últimas transações</p>
          <span className="flex items-center gap-1 rounded-md px-2 py-1 text-ardosia-500 ring-1 ring-ardosia-200">
            <SlidersHorizontal className="size-3" aria-hidden /> Filtrar
          </span>
        </div>
        <m.ul className="mt-2 divide-y divide-ardosia-200 text-[0.6875rem]" variants={list} initial="hidden" animate="show">
          {rows.map((r) => (
            <m.li key={r.date} variants={item} className="grid grid-cols-[1fr_1.3fr_1fr_auto] items-center gap-2 py-2">
              <span className="text-ardosia-500 tabular-nums">{r.date}</span>
              <span className="flex items-center gap-1.5 text-marinho-950">
                <CreditCard className="size-3.5 text-ardosia-500" aria-hidden />
                {r.method}
              </span>
              <span className="text-right font-semibold text-marinho-950 tabular-nums">{formatBRL(r.value)}</span>
              <StatusPill status={r.status} />
            </m.li>
          ))}
        </m.ul>
      </div>
    </Window>
  );
}
