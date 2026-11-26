"use client";

import { animate, useMotionValue, useTransform } from "motion/react";
import { useCallback } from "react";
import { formatBRL } from "@/lib/format";
import { EASE_OUT } from "@/lib/motion";

/*
 * Vendas de demonstração usadas nos mockups do hero (desktop e mobile).
 * Dados 100% fictícios: não representam o sistema real da GIMO Pay.
 */

export type DemoMethod = "Pix" | "Crédito" | "Débito" | "Link de pagamento" | "Loja virtual";

export type DemoSale = {
  order: string;
  method: DemoMethod;
  /** Título da notificação de venda aprovada. */
  title: string;
  detail: string;
  amount: number;
};

export const demoSales: DemoSale[] = [
  { order: "Pedido 1042", method: "Pix", title: "Pix recebido", detail: "Pagamento instantâneo", amount: 248.9 },
  { order: "Pedido 1043", method: "Crédito", title: "Crédito aprovado", detail: "3x no cartão", amount: 1290 },
  { order: "Pedido 1044", method: "Débito", title: "Débito aprovado", detail: "À vista no cartão", amount: 86.5 },
  { order: "Pedido 0482", method: "Link de pagamento", title: "Link de pagamento pago", detail: "Venda à distância", amount: 180 },
  { order: "Pedido 1045", method: "Loja virtual", title: "Venda na loja virtual", detail: "Gateway de pagamento", amount: 349.9 },
];

/** Vendas que passam pelo checkout do celular no hero (meios de pagamento da copy). */
export const checkoutSales = demoSales.filter((s) => s.method === "Pix" || s.method === "Crédito" || s.method === "Débito");

/** Valor inicial fictício do contador "Vendas de hoje". */
export const DEMO_DAY_START = 3000;

/** Contador "Vendas de hoje": valor animado e formatado em reais. */
export function useSalesTotal(start = DEMO_DAY_START) {
  const total = useMotionValue(start);
  const text = useTransform(total, (v) => formatBRL(v));
  const add = useCallback(
    (amount: number) => animate(total, total.get() + amount, { duration: 1, ease: EASE_OUT }),
    [total],
  );
  return { total, text, add };
}
