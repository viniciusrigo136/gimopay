"use client";

import { AnimatePresence, m } from "motion/react";
import { useEffect, useState } from "react";
import { Check, CheckCheck, Copy, CreditCard, Link2, Mail, MessageCircle, QrCode, Send } from "lucide-react";
import { WavesGlyph } from "@/components/brand/Waves";
import { PhoneFrame, StatusBar } from "@/components/mockups/PhoneFrame";
import { ScaleToFit } from "@/components/motion/ScaleToFit";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";
import { EASE_OUT as ease } from "@/lib/motion";

/**
 * Celular com as telas do link de pagamento, uma por passo.
 * Dados fictícios, apenas demonstrativos.
 */

export function StepPhone({ step }: { step: number }) {
  return (
    <ScaleToFit width={296} height={575}>
      <PhoneFrame className="w-[296px]">
        <StatusBar />
        <div className="relative h-[calc(100%-2.5rem)] overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <m.div
              key={step}
              className="absolute inset-0 flex flex-col px-5 pb-5 pt-2"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              transition={{ duration: 0.45, ease }}
            >
              {step === 0 && <ScreenCreate />}
              {step === 1 && <ScreenShare />}
              {step === 2 && <ScreenSell />}
              {step === 3 && <ScreenTrack />}
            </m.div>
          </AnimatePresence>
        </div>
      </PhoneFrame>
    </ScaleToFit>
  );
}

function ScreenTitle({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <div className="mb-4">
      <p className="text-[1.0625rem] font-bold tracking-[-0.02em] text-marinho-950">{children}</p>
      {sub && <p className="text-[0.75rem] text-ardosia-500">{sub}</p>}
    </div>
  );
}

function TypedValue({ value }: { value: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (n >= value.length) return;
    const t = window.setTimeout(() => setN((x) => x + 1), 70);
    return () => clearTimeout(t);
  }, [n, value]);
  return (
    <>
      {value.slice(0, n)}
      <m.span
        className="ml-0.5 inline-block h-5 w-[2px] translate-y-0.5 bg-ciano-500"
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
      />
    </>
  );
}

function ScreenCreate() {
  return (
    <>
      <ScreenTitle sub="Preencha os dados da venda">Novo link de pagamento</ScreenTitle>
      <label className="text-[0.6875rem] font-medium text-ardosia-500">Valor</label>
      <div className="mt-1 rounded-xl px-3.5 py-3 text-[1.5rem] font-bold tracking-[-0.03em] text-marinho-950 ring-2 ring-ciano-500">
        <TypedValue value={formatBRL(180)} />
      </div>
      <label className="mt-4 text-[0.6875rem] font-medium text-ardosia-500">Descrição</label>
      <div className="mt-1 rounded-xl px-3.5 py-3 text-[0.8125rem] text-marinho-950 ring-1 ring-ardosia-200">Pedido 0482</div>
      <label className="mt-4 text-[0.6875rem] font-medium text-ardosia-500">Formas de pagamento</label>
      <div className="mt-1.5 flex flex-wrap gap-1.5 text-[0.6875rem] font-medium">
        {["Pix", "Crédito", "Débito"].map((x) => (
          <span key={x} className="flex items-center gap-1 rounded-full bg-ciano-50 px-2.5 py-1 text-marinho-800 ring-1 ring-ciano-200">
            <Check className="size-3" strokeWidth={3} aria-hidden /> {x}
          </span>
        ))}
      </div>
      <m.div
        className="mt-auto flex items-center justify-center gap-2 rounded-xl bg-ciano-500 py-3.5 text-[0.875rem] font-semibold text-marinho-950"
        animate={{ scale: [1, 1, 0.96, 1] }}
        transition={{ duration: 0.6, delay: 1.6, times: [0, 0.6, 0.8, 1] }}
      >
        <Link2 className="size-4" aria-hidden /> Gerar link
      </m.div>
    </>
  );
}

function ScreenShare() {
  return (
    <>
      <ScreenTitle sub="Pronto para enviar">Link gerado</ScreenTitle>
      <div className="overflow-hidden rounded-2xl ring-1 ring-ardosia-200">
        <div className="flex items-center gap-2 bg-marinho-950 px-4 py-3 text-white">
          <WavesGlyph className="h-4 w-3 text-ciano-500" strokeWidth={6} />
          <span className="text-[0.75rem] font-semibold">Pedido 0482</span>
        </div>
        <div className="p-4">
          <p className="text-[1.5rem] font-bold tracking-[-0.03em] text-marinho-950">{formatBRL(180)}</p>
          <p className="mt-2 flex items-center gap-2 rounded-lg bg-nevoa px-3 py-2 text-[0.6875rem] text-ardosia-500">
            <Link2 className="size-3.5 shrink-0" aria-hidden />
            <span className="truncate">link de pagamento demonstrativo</span>
          </p>
        </div>
      </div>
      <p className="mb-2 mt-5 text-[0.75rem] font-semibold text-marinho-950">Enviar por</p>
      <m.div
        className="grid grid-cols-3 gap-2"
        initial="h"
        animate="s"
        variants={{ s: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
      >
        {[
          { icon: MessageCircle, label: "WhatsApp" },
          { icon: Mail, label: "E-mail" },
          { icon: Copy, label: "Copiar" },
        ].map(({ icon: Icon, label }, i) => (
          <m.span
            key={label}
            variants={{ h: { opacity: 0, y: 10 }, s: { opacity: 1, y: 0 } }}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl py-3 text-[0.6875rem] font-medium ring-1",
              i === 0 ? "bg-ciano-50 text-marinho-950 ring-ciano-500" : "text-ardosia-700 ring-ardosia-200",
            )}
          >
            <Icon className="size-4" aria-hidden />
            {label}
          </m.span>
        ))}
      </m.div>
      <m.div
        className="mt-auto flex items-center gap-2 rounded-xl bg-marinho-950 px-4 py-3 text-[0.75rem] text-white"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.1, duration: 0.5, ease }}
      >
        <Send className="size-4 text-ciano-500" aria-hidden /> Link enviado ao cliente
        <CheckCheck className="ml-auto size-4 text-ciano-500" aria-hidden />
      </m.div>
    </>
  );
}

function ScreenSell() {
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setPaid(true), 1500);
    return () => clearTimeout(t);
  }, []);
  return (
    <>
      <ScreenTitle sub="Visão do seu cliente">Loja Exemplo</ScreenTitle>
      <div className="rounded-2xl bg-nevoa p-4">
        <p className="text-[0.6875rem] text-ardosia-500">Pedido 0482</p>
        <p className="text-[1.5rem] font-bold tracking-[-0.03em] text-marinho-950">{formatBRL(180)}</p>
      </div>
      <p className="mb-2 mt-4 text-[0.75rem] font-semibold text-marinho-950">Escolha como pagar</p>
      <div className="space-y-1.5 text-[0.75rem]">
        {[
          { icon: QrCode, label: "Pix" },
          { icon: CreditCard, label: "Crédito" },
          { icon: CreditCard, label: "Débito" },
        ].map(({ icon: Icon, label }, i) => (
          <div
            key={label}
            className={cn(
              "flex items-center gap-2.5 rounded-xl px-3.5 py-3 ring-1",
              i === 1 ? "bg-ciano-50 text-marinho-950 ring-2 ring-ciano-500" : "text-ardosia-500 ring-ardosia-200",
            )}
          >
            <Icon className="size-4" aria-hidden /> {label}
          </div>
        ))}
      </div>
      <div className="mt-auto">
        <AnimatePresence mode="wait">
          {paid ? (
            <m.div
              key="ok"
              className="flex items-center gap-3 rounded-xl bg-marinho-950 px-4 py-3 text-white"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 420, damping: 26 }}
            >
              <span className="grid size-8 place-items-center rounded-full bg-ciano-500 text-marinho-950">
                <Check className="size-4" strokeWidth={3} aria-hidden />
              </span>
              <span className="text-[0.8125rem] font-semibold">Pagamento aprovado</span>
            </m.div>
          ) : (
            <m.div
              key="pay"
              exit={{ opacity: 0 }}
              className="rounded-xl bg-ciano-500 py-3.5 text-center text-[0.875rem] font-semibold text-marinho-950"
            >
              Pagar {formatBRL(180)}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

function ScreenTrack() {
  const timeline = [
    { label: "Link criado", time: "09:12" },
    { label: "Enviado ao cliente", time: "09:13" },
    { label: "Pagamento aprovado", time: "09:27" },
  ];
  return (
    <>
      <ScreenTitle sub="Acompanhe em tempo real">Status do pagamento</ScreenTitle>
      <div className="flex items-center justify-between rounded-2xl bg-nevoa p-4">
        <div>
          <p className="text-[0.6875rem] text-ardosia-500">Pedido 0482</p>
          <p className="text-[1.25rem] font-bold tracking-[-0.03em] text-marinho-950">{formatBRL(180)}</p>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-sucesso">
          <Check className="size-3" strokeWidth={3} aria-hidden /> Pago
        </span>
      </div>
      <m.ol
        className="mt-5 space-y-0"
        initial="h"
        animate="s"
        variants={{ s: { transition: { staggerChildren: 0.2, delayChildren: 0.15 } } }}
      >
        {timeline.map((t, i) => (
          <m.li
            key={t.label}
            variants={{ h: { opacity: 0, x: -10 }, s: { opacity: 1, x: 0 } }}
            className="relative flex gap-3 pb-4 text-[0.75rem]"
          >
            {i < timeline.length - 1 && <span className="absolute left-[7px] top-4 h-full w-px bg-ciano-200" />}
            <span className="relative mt-0.5 size-[15px] shrink-0 rounded-full border-[3px] border-ciano-500 bg-white" />
            <span className="flex-1 text-marinho-950">{t.label}</span>
            <span className="text-ardosia-500 tabular-nums">{t.time}</span>
          </m.li>
        ))}
      </m.ol>
      <div className="mt-auto rounded-2xl bg-marinho-950 p-4 text-white">
        <p className="text-[0.6875rem] text-ardosia-300">Recebimentos do mês</p>
        <p className="text-[1.25rem] font-bold tracking-[-0.03em]">{formatBRL(12480)}</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
          <m.div
            className="h-full origin-left rounded-full bg-ciano-500"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 0.68 }}
            transition={{ duration: 1.2, ease, delay: 0.5 }}
          />
        </div>
      </div>
    </>
  );
}
