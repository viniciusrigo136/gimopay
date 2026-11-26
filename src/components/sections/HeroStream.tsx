"use client";

import {
  AnimatePresence,
  animate,
  m,
  useInView,
  useMotionValue,
  useScroll,
  useTransform,
} from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, CreditCard, Link2, QrCode, ShoppingBag, type LucideIcon } from "lucide-react";
import { WavesGlyph } from "@/components/brand/Waves";
import { IllustrativeBadge } from "@/components/ui/IllustrativeBadge";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { formatBRL } from "@/lib/format";

/* Notificações 100% fictícias, apenas demonstrativas. */
type Sale = { icon: LucideIcon; title: string; detail: string; amount: number };
const sales: Sale[] = [
  { icon: QrCode, title: "Pix recebido", detail: "Pedido 1042", amount: 248.9 },
  { icon: CreditCard, title: "Crédito aprovado", detail: "3x no cartão", amount: 1290 },
  { icon: Link2, title: "Link de pagamento pago", detail: "Pedido 0482", amount: 180 },
  { icon: CreditCard, title: "Débito aprovado", detail: "À vista", amount: 86.5 },
  { icon: ShoppingBag, title: "Venda na loja virtual", detail: "Gateway de pagamento", amount: 349.9 },
];

const INTERVAL = 2600;
const VISIBLE = 3;
const BASE_TOTAL = 2840;
const spring = { type: "spring", stiffness: 380, damping: 30, mass: 0.9 } as const;

type Item = { id: number; sale: number };

export function HeroStream() {
  const reduce = usePrefersReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.25 });
  const [items, setItems] = useState<Item[]>([
    { id: 1, sale: 1 },
    { id: 0, sale: 0 },
  ]);
  const nextId = useRef(2);
  const total = useMotionValue(BASE_TOTAL);
  const totalText = useTransform(total, (v) => formatBRL(v));
  const [pulse, setPulse] = useState(0);

  // Parallax: o bloco sobe e suaviza enquanto o usuário rola.
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, -70]);
  const opacity = useTransform(scrollY, [0, 420], [1, 0.25]);

  const push = useCallback(() => {
    const id = nextId.current++;
    const sale = id % sales.length;
    setItems((list) => [{ id, sale }, ...list].slice(0, VISIBLE + 1));
    setPulse((p) => p + 1);
    animate(total, total.get() + sales[sale].amount, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
  }, [total]);

  useEffect(() => {
    if (reduce || !inView) return;
    const first = window.setTimeout(push, 900);
    const loop = window.setInterval(push, INTERVAL);
    return () => {
      clearTimeout(first);
      clearInterval(loop);
    };
  }, [reduce, inView, push]);

  const visible = items.slice(0, VISIBLE);

  return (
    <m.div ref={ref} style={reduce ? undefined : { y, opacity }} className="relative">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center rounded-[0.75rem] bg-ciano-500 text-white shadow-[0_8px_18px_-8px_rgba(2,170,215,.9)]">
            <WavesGlyph className="h-4 w-3" strokeWidth={6} />
            <AnimatePresence>
              {!reduce && (
                <m.span
                  key={pulse}
                  aria-hidden
                  className="absolute inset-0 rounded-[0.75rem] ring-2 ring-ciano-500"
                  initial={{ scale: 1, opacity: 0.7 }}
                  animate={{ scale: 1.7, opacity: 0 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </span>
          <div className="leading-tight">
            <p className="text-[0.6875rem] font-medium text-ardosia-500">Vendas de hoje</p>
            <m.p className="text-[1.0625rem] font-bold tracking-[-0.02em] text-marinho-950 tabular-nums">
              {totalText}
            </m.p>
          </div>
        </div>
        <IllustrativeBadge />
      </div>

      {/* Pilha de notificações: toque para simular a próxima venda */}
      <m.div
        className="relative h-[110px] cursor-pointer select-none [-webkit-tap-highlight-color:transparent]"
        onTap={reduce ? undefined : push}
        whileTap={reduce ? undefined : { scale: 0.98 }}
        aria-hidden
      >
        <AnimatePresence initial={false}>
          {visible.map((item, pos) => {
            const sale = sales[item.sale];
            const Icon = sale.icon;
            return (
              <m.div
                key={item.id}
                className="absolute inset-x-0 top-0 origin-top"
                style={{ zIndex: VISIBLE - pos }}
                initial={{ y: -46, opacity: 0, scale: 1.04 }}
                animate={{ y: pos * 17, scale: 1 - pos * 0.06, opacity: 1 - pos * 0.3 }}
                exit={{ y: VISIBLE * 17 + 8, scale: 0.8, opacity: 0, transition: { duration: 0.35 } }}
                transition={spring}
              >
                <div className="flex items-center gap-3 rounded-[1.125rem] bg-white/95 p-3 pr-3.5 shadow-[0_18px_40px_-18px_rgba(13,24,42,.35),0_0_0_1px_var(--color-ardosia-200)] backdrop-blur">
                  <span className="grid size-11 shrink-0 place-items-center rounded-[0.875rem] bg-ciano-50 text-ciano-700">
                    <Icon className="size-5" strokeWidth={1.8} />
                  </span>
                  <span className="min-w-0 flex-1 leading-tight">
                    <span className="block truncate text-[0.875rem] font-semibold text-marinho-950">{sale.title}</span>
                    <span className="block truncate text-[0.75rem] text-ardosia-500">{sale.detail}</span>
                  </span>
                  <span className="flex flex-col items-end gap-1">
                    <span className="text-[0.9375rem] font-bold tracking-[-0.02em] text-marinho-950 tabular-nums">
                      {formatBRL(sale.amount)}
                    </span>
                    <span className="flex items-center gap-1 text-[0.625rem] font-semibold text-sucesso">
                      <Check className="size-3" strokeWidth={3} />
                      Aprovado
                    </span>
                  </span>
                </div>
              </m.div>
            );
          })}
        </AnimatePresence>
      </m.div>
    </m.div>
  );
}
