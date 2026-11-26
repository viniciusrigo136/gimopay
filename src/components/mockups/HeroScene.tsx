"use client";

import {
  AnimatePresence,
  m,
  useInView,
} from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useEffect, useRef, useState } from "react";
import { Check, CreditCard, Link2, QrCode } from "lucide-react";
import { ScaleToFit } from "@/components/motion/ScaleToFit";
import { PhoneFrame, StatusBar } from "@/components/mockups/PhoneFrame";
import { IllustrativeBadge } from "@/components/ui/IllustrativeBadge";
import { WavesGlyph } from "@/components/brand/Waves";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";
import { checkoutSales, DEMO_DAY_START, useSalesTotal } from "./demoSales";

const transactions = checkoutSales;

const methods = ["Pix", "Crédito", "Débito"] as const;
const methodIcon = { Pix: QrCode, Crédito: CreditCard, Débito: CreditCard } as const;

const baseBars = [34, 52, 41, 66, 48, 72];

type Phase = "checkout" | "select" | "paying" | "approved";
const timeline: Array<[Phase, number]> = [
  ["checkout", 0],
  ["select", 900],
  ["paying", 1900],
  ["approved", 2700],
];
const CYCLE = 6400;

export function HeroScene() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.3 });
  const [txIndex, setTxIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("checkout");
  const [cycle, setCycle] = useState(0);
  const [settled, setSettled] = useState<Array<{ idx: number; id: number }>>([]);

  const { total, text: totalText, add: addToTotal } = useSalesTotal();

  // Estado final estático para quem prefere menos movimento.
  useEffect(() => {
    if (reduce) total.set(DEMO_DAY_START + transactions[0].amount);
  }, [reduce, total]);

  useEffect(() => {
    if (reduce || !inView) return;
    const tx = transactions[txIndex];
    const timers = timeline.map(([p, t]) => window.setTimeout(() => setPhase(p), t + 600));
    timers.push(
      window.setTimeout(() => {
        setSettled((s) => [...s, { idx: txIndex, id: cycle }].slice(-3));
        addToTotal(tx.amount);
      }, 3500),
      window.setTimeout(() => {
        setTxIndex((i) => (i + 1) % transactions.length);
        setCycle((c) => c + 1);
      }, CYCLE),
    );
    return () => timers.forEach(clearTimeout);
  }, [txIndex, cycle, inView, reduce, addToTotal]);

  const tx = transactions[txIndex];
  const phaseView: Phase = reduce ? "approved" : phase;
  const settledView = reduce ? [{ idx: 0, id: 0 }] : settled;
  const approved = phaseView === "approved";
  const selected = phaseView !== "checkout";

  return (
    <ScaleToFit width={520} height={600}>
    <div ref={ref} className="relative h-full w-full">
      {/* Tile da marca ao fundo */}
      <m.div
        aria-hidden
        className="absolute right-[2%] top-[4%] h-[78%] w-[80%] rounded-[22%] bg-gradient-to-br from-ciano-100 to-ciano-50"
        initial={{ scale: 0.86, opacity: 0, rotate: -4 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.2, ease: EASE_OUT, delay: 0.2 }}
      />

      {/* Ondas que pulsam na aprovação */}
      <div aria-hidden className="pointer-events-none absolute right-[3%] top-[33%]">
        <AnimatePresence>
          {approved &&
            [0, 1, 2].map((i) => (
              <m.span
                key={`${cycle}-${i}`}
                className="absolute left-1/2 top-1/2 size-40 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ciano-500"
                initial={{ scale: 0.6, opacity: 0.55 }}
                animate={{ scale: 2.6 + i * 0.5, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.8, delay: i * 0.18, ease: [0.22, 1, 0.36, 1] }}
              />
            ))}
        </AnimatePresence>
      </div>

      {/* Celular com checkout de link de pagamento */}
      <m.div
        className="absolute right-[7%] top-0 w-[285px]"
        initial={{ y: 60, opacity: 0, rotate: 3 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 1.1, ease: EASE_OUT, delay: 0.35 }}
      >
        <PhoneFrame>
          <StatusBar />
          <div className="flex h-[calc(100%-2.5rem)] flex-col px-4 pb-4 pt-2 text-[0.7rem]">
            <div className="flex items-center gap-2">
              <span className="grid size-8 place-items-center rounded-xl bg-marinho-800 text-[0.7rem] font-bold text-white">
                LE
              </span>
              <div className="leading-tight">
                <p className="font-semibold text-marinho-950">Loja Exemplo</p>
                <p className="flex items-center gap-1 text-[0.625rem] text-ardosia-500">
                  <Link2 className="size-3" aria-hidden /> Link de pagamento
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-2xl bg-nevoa p-3.5">
              <p className="text-[0.625rem] text-ardosia-500">{tx.order}</p>
              <AnimatePresence mode="popLayout" initial={false}>
                <m.p
                  key={tx.order}
                  className="mt-0.5 text-[1.375rem] font-bold tracking-[-0.03em] text-marinho-950"
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.45, ease: EASE_OUT }}
                >
                  {formatBRL(tx.amount)}
                </m.p>
              </AnimatePresence>
            </div>

            <p className="mb-2 mt-4 font-semibold text-marinho-950">Forma de pagamento</p>
            <div className="flex flex-col gap-1.5">
              {methods.map((method) => {
                const Icon = methodIcon[method];
                const on = selected && tx.method === method;
                return (
                  <div
                    key={method}
                    className={cn(
                      "relative flex items-center gap-2.5 rounded-xl px-3 py-2.5 ring-1 transition-colors duration-300",
                      on ? "text-marinho-950 ring-transparent" : "text-ardosia-500 ring-ardosia-200",
                    )}
                  >
                    {on && (
                      <m.span
                        layoutId="hero-method"
                        className="absolute inset-0 rounded-xl bg-ciano-50 ring-2 ring-ciano-500"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                    <Icon className="relative size-4" aria-hidden />
                    <span className="relative font-medium">{method}</span>
                    {on && (
                      <m.span
                        className="relative ml-auto text-[0.625rem] text-ardosia-500"
                        initial={{ opacity: 0, x: 6 }}
                        animate={{ opacity: 1, x: 0 }}
                      >
                        {tx.detail}
                      </m.span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-auto flex items-center justify-between border-t border-dashed border-ardosia-200 pb-3 pt-3">
              <span className="text-ardosia-500">Total</span>
              <span className="font-semibold text-marinho-950 tabular-nums">{formatBRL(tx.amount)}</span>
            </div>
            <div>
              <AnimatePresence mode="wait" initial={false}>
                {approved ? (
                  <m.div
                    key="ok"
                    className="flex items-center gap-2.5 rounded-xl bg-marinho-950 px-3 py-3 text-white"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", stiffness: 420, damping: 26 }}
                  >
                    <m.span
                      className="grid size-7 place-items-center rounded-full bg-ciano-500 text-marinho-950"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 18, delay: 0.1 }}
                    >
                      <Check className="size-4" strokeWidth={3} aria-hidden />
                    </m.span>
                    <div className="leading-tight">
                      <p className="font-semibold">Pagamento aprovado</p>
                      <p className="text-[0.625rem] text-ardosia-300">{tx.method}</p>
                    </div>
                  </m.div>
                ) : (
                  <m.div
                    key="pay"
                    className="flex h-[3.25rem] items-center justify-center gap-2 rounded-xl bg-ciano-500 font-semibold text-marinho-950"
                    animate={phaseView === "paying" ? { scale: [1, 0.96, 1] } : { scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.35 }}
                  >
                    {phaseView === "paying" ? (
                      <m.span
                        className="size-4 rounded-full border-2 border-marinho-950/25 border-t-marinho-950"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.7, ease: "linear" }}
                      />
                    ) : (
                      "Pagar agora"
                    )}
                  </m.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </PhoneFrame>
      </m.div>

      {/* Ícone de ondas: assinatura da marca ao lado do celular */}
      <m.div
        aria-hidden
        className="absolute right-[1%] top-[27%] text-ciano-500"
        animate={approved ? { x: [0, 6, 0], opacity: [0.5, 1, 0.5] } : { opacity: 0.45 }}
        transition={{ duration: 0.9 }}
      >
        <WavesGlyph className="h-16 w-10" />
      </m.div>

      {/* Painel: vendas do dia */}
      <m.div
        className="absolute left-0 top-[33%] w-[236px] rounded-[var(--radius-panel)] bg-white p-5 shadow-flutuante"
        initial={{ x: -40, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1, ease: EASE_OUT, delay: 0.75 }}
      >
        <p className="text-[0.6875rem] font-medium text-ardosia-500">Vendas de hoje</p>
        <m.p className="mt-0.5 text-[1.5rem] font-bold tracking-[-0.03em] text-marinho-950 tabular-nums">
          {totalText}
        </m.p>
        <div className="mt-3 flex h-14 items-end gap-1.5" aria-hidden>
          {baseBars.map((h, i) => (
            <span key={i} className="flex-1 rounded-t-[4px] bg-ardosia-200" style={{ height: `${h}%` }} />
          ))}
          <m.span
            className="flex-1 origin-bottom rounded-t-[4px] bg-ciano-500"
            style={{ height: "88%" }}
            initial={{ scaleY: 0.15 }}
            animate={{ scaleY: 0.15 + Math.min(settledView.length, 3) * 0.283 }}
            transition={{ type: "spring", stiffness: 120, damping: 16 }}
          />
        </div>
        <ul className="mt-3 space-y-1.5 border-t border-ardosia-200 pt-3 text-[0.6875rem]">
          <AnimatePresence initial={false}>
            {settledView
              .slice(-2)
              .reverse()
              .map(({ idx, id }) => {
                const t = transactions[idx];
                return (
                  <m.li
                    key={id}
                    layout
                    className="flex items-center justify-between gap-2"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <span className="flex items-center gap-1.5 text-ardosia-700">
                      <span className="size-1.5 rounded-full bg-sucesso" />
                      {t.method}
                    </span>
                    <span className="font-semibold text-marinho-950 tabular-nums">
                      {formatBRL(t.amount)}
                    </span>
                  </m.li>
                );
              })}
          </AnimatePresence>
          {settledView.length === 0 && (
            <li className="text-ardosia-500">Aguardando novas vendas</li>
          )}
        </ul>
      </m.div>

      <IllustrativeBadge className="absolute bottom-0 right-[10%]" />
    </div>
    </ScaleToFit>
  );
}
