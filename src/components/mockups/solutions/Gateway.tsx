"use client";

import { m } from "motion/react";
import { Layers } from "lucide-react";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";
import { item, list, Window } from "./shared";
import { EASE_OUT as ease } from "@/lib/motion";

/* Mockup demonstrativo: nomes, valores e datas são fictícios. */

/* 1. Gateway de pagamento */
export function GatewayMock() {
  const channels = [
    { name: "Loja virtual", method: "Crédito", value: 349.9 },
    { name: "Aplicativo", method: "Pix", value: 72.5 },
    { name: "Sistema de gestão", method: "Débito", value: 1180 },
  ];
  return (
    <div className="relative h-full">
      <Window title="sua-plataforma / checkout" className="absolute left-0 top-0 w-[390px]">
        <div className="grid grid-cols-2 gap-4 p-4 text-[0.6875rem]">
          <div>
            <p className="font-semibold text-marinho-950">Resumo do pedido</p>
            <div className="mt-3 space-y-2 text-ardosia-500">
              <p className="flex justify-between">
                <span>Produto exemplo</span>
                <span>{formatBRL(299.9)}</span>
              </p>
              <p className="flex justify-between">
                <span>Frete</span>
                <span>{formatBRL(50)}</span>
              </p>
              <p className="flex justify-between border-t border-ardosia-200 pt-2 font-semibold text-marinho-950">
                <span>Total</span>
                <span>{formatBRL(349.9)}</span>
              </p>
            </div>
          </div>
          <div className="space-y-1.5">
            <p className="font-semibold text-marinho-950">Pagamento</p>
            {["Pix", "Crédito", "Débito"].map((x, i) => (
              <div
                key={x}
                className={cn(
                  "rounded-lg px-2.5 py-1.5 ring-1",
                  i === 1 ? "bg-ciano-50 ring-ciano-500 text-marinho-950" : "ring-ardosia-200 text-ardosia-500",
                )}
              >
                {x}
              </div>
            ))}
            <div className="mt-2 rounded-lg bg-ciano-500 py-2 text-center font-semibold text-marinho-950">
              Finalizar compra
            </div>
          </div>
        </div>
      </Window>

      <m.div
        className="absolute bottom-0 right-0 w-[330px] rounded-[var(--radius-panel)] bg-marinho-950 p-4 text-white shadow-escuro"
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.1 }}
      >
        <p className="flex items-center gap-2 text-[0.75rem] font-semibold">
          <Layers className="size-4 text-ciano-500" aria-hidden /> Processamento centralizado
        </p>
        <m.ul className="mt-3 space-y-2" variants={list} initial="hidden" animate="show">
          {channels.map((c) => (
            <m.li
              key={c.name}
              variants={item}
              className="flex items-center justify-between rounded-lg bg-white/6 px-3 py-2 text-[0.6875rem]"
            >
              <span>
                <span className="block font-medium">{c.name}</span>
                <span className="text-ardosia-300">{c.method}</span>
              </span>
              <span className="font-semibold tabular-nums">{formatBRL(c.value)}</span>
            </m.li>
          ))}
        </m.ul>
      </m.div>
    </div>
  );
}
