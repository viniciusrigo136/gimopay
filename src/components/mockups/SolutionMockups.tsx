"use client";

import { m } from "motion/react";
import { useEffect, useState } from "react";
import {
  ArrowDownToLine,
  Check,
  CheckCheck,
  Clock3,
  Copy,
  CreditCard,
  Layers,
  Mail,
  MessageCircle,
  Share2,
  SlidersHorizontal,
} from "lucide-react";
import { WavesGlyph } from "@/components/brand/Waves";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";
import type { SolutionId } from "@/content/copy";

/*
 * Mockups demonstrativos. Todos os nomes, valores e datas são fictícios
 * e não representam o sistema real da GIMO Pay.
 */

const ease = [0.16, 1, 0.3, 1] as const;

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.15 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
};

function Window({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[var(--radius-panel)] bg-white shadow-[0_30px_70px_-30px_rgba(13,24,42,.4),0_0_0_1px_var(--color-ardosia-200)]",
        className,
      )}
    >
      <div className="flex items-center gap-2 border-b border-ardosia-200 bg-nevoa px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-ardosia-200" />
          ))}
        </span>
        <span className="mx-auto rounded-md bg-white px-3 py-0.5 text-[0.6875rem] text-ardosia-500 ring-1 ring-ardosia-200">
          {title}
        </span>
      </div>
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: "Aprovado" | "Pendente" | "Recebido" }) {
  const ok = status !== "Pendente";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.625rem] font-semibold",
        ok ? "bg-emerald-50 text-sucesso" : "bg-amber-50 text-amber-700",
      )}
    >
      {ok ? <Check className="size-3" strokeWidth={3} aria-hidden /> : <Clock3 className="size-3" aria-hidden />}
      {status}
    </span>
  );
}

/* 1. Gateway de pagamento */
function GatewayMock() {
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
        className="absolute bottom-0 right-0 w-[330px] rounded-[var(--radius-panel)] bg-marinho-950 p-4 text-white shadow-[0_30px_60px_-24px_rgba(13,24,42,.6)]"
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

/* 2. Link de pagamento */
function LinkMock() {
  return (
    <div className="relative h-full">
      <div className="absolute inset-y-0 left-6 w-[330px] overflow-hidden rounded-[var(--radius-panel)] bg-[#eef3f7] shadow-[0_30px_70px_-30px_rgba(13,24,42,.4),0_0_0_1px_var(--color-ardosia-200)]">
        <div className="flex items-center gap-2.5 bg-white px-4 py-3 text-[0.75rem] shadow-[0_1px_0_var(--color-ardosia-200)]">
          <span className="grid size-8 place-items-center rounded-full bg-ardosia-200 font-semibold text-marinho-800">
            C
          </span>
          <span>
            <span className="block font-semibold text-marinho-950">Cliente</span>
            <span className="text-[0.625rem] text-ardosia-500">Conversa</span>
          </span>
        </div>
        <m.div className="space-y-2.5 p-4 text-[0.75rem]" variants={list} initial="hidden" animate="show">
          <m.p variants={item} className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-ciano-100 px-3 py-2 text-marinho-950">
            Olá! Segue o link para pagamento do seu pedido.
          </m.p>
          <m.div variants={item} className="ml-auto w-[78%] overflow-hidden rounded-2xl rounded-br-md bg-white ring-1 ring-ardosia-200">
            <div className="flex items-center gap-2 bg-marinho-950 px-3 py-2.5 text-white">
              <WavesGlyph className="h-4 w-3 text-ciano-500" strokeWidth={6} />
              <span className="text-[0.6875rem] font-semibold">Link de pagamento</span>
            </div>
            <div className="p-3">
              <p className="text-[0.625rem] text-ardosia-500">Pedido 0482</p>
              <p className="text-[1.125rem] font-bold text-marinho-950">{formatBRL(180)}</p>
              <p className="mt-2 rounded-lg bg-ciano-500 py-1.5 text-center text-[0.6875rem] font-semibold text-marinho-950">
                Pagar agora
              </p>
            </div>
          </m.div>
          <m.p variants={item} className="flex items-center justify-end gap-1 text-[0.625rem] text-ardosia-500">
            Enviado <CheckCheck className="size-3.5 text-ciano-600" aria-hidden />
          </m.p>
          <m.p variants={item} className="max-w-[70%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-marinho-950">
            Pagamento feito!
          </m.p>
        </m.div>
      </div>

      <m.div
        className="absolute right-0 top-10 w-[200px] rounded-[var(--radius-panel)] bg-white p-4 shadow-[0_24px_50px_-24px_rgba(13,24,42,.35),0_0_0_1px_var(--color-ardosia-200)]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.3 }}
      >
        <p className="flex items-center gap-2 text-[0.75rem] font-semibold text-marinho-950">
          <Share2 className="size-4 text-ciano-600" aria-hidden /> Compartilhar
        </p>
        <ul className="mt-3 space-y-1.5 text-[0.6875rem] text-ardosia-700">
          {[
            { icon: MessageCircle, label: "WhatsApp" },
            { icon: Mail, label: "E-mail" },
            { icon: Copy, label: "Outros canais" },
          ].map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-2 rounded-lg px-2 py-1.5 ring-1 ring-ardosia-200">
              <Icon className="size-3.5 text-ardosia-500" aria-hidden />
              {label}
            </li>
          ))}
        </ul>
      </m.div>
    </div>
  );
}

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
        return on ? <rect key={i} x={c} y={r} width="1" height="1" fill="#0d182a" /> : null;
      })}
      {[
        [0, 0],
        [14, 0],
        [0, 14],
      ].map(([x, y]) => (
        <g key={`${x}-${y}`} fill="none" stroke="#0d182a">
          <rect x={x + 0.5} y={y + 0.5} width="6" height="6" />
          <rect x={x + 2} y={y + 2} width="3" height="3" fill="#0d182a" />
        </g>
      ))}
    </svg>
  );
}

/* 3. Pix */
function PixMock() {
  const [received, setReceived] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setReceived(true), 1600);
    return () => clearTimeout(t);
  }, []);
  return (
    <div className="relative grid h-full place-items-center">
      <div className="w-[300px] rounded-[var(--radius-panel)] bg-white p-5 text-center shadow-[0_30px_70px_-30px_rgba(13,24,42,.4),0_0_0_1px_var(--color-ardosia-200)]">
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

function PaymentCard({ label }: { label: string }) {
  return (
    <div className="relative h-[170px] w-[270px] overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-ciano-500 to-[#0384b3] p-5 text-white shadow-[0_30px_60px_-24px_rgba(2,120,170,.7)]">
      <WavesGlyph className="absolute -right-4 -top-6 h-48 w-32 text-white/15" strokeWidth={4} />
      <div className="h-7 w-10 rounded-md bg-white/35" />
      <p className="mt-8 font-semibold tracking-[0.18em] text-[0.9375rem]">•••• •••• •••• 4821</p>
      <p className="mt-2 flex justify-between text-[0.6875rem] text-white/80">
        <span>CLIENTE EXEMPLO</span>
        <span>{label}</span>
      </p>
    </div>
  );
}

/* 4. Cartão de crédito */
function CreditMock() {
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
      <div className="absolute bottom-0 right-0 w-[300px] rounded-[var(--radius-panel)] bg-white p-5 shadow-[0_30px_70px_-30px_rgba(13,24,42,.4),0_0_0_1px_var(--color-ardosia-200)]">
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

/* 5. Cartão de débito */
function DebitMock() {
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
        className="absolute bottom-2 left-0 w-[290px] rounded-[var(--radius-panel)] bg-marinho-950 p-5 text-white shadow-[0_30px_60px_-24px_rgba(13,24,42,.6)]"
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

/* 6. Antecipação de recebíveis */
function AdvanceMock() {
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
      <div className="absolute inset-x-0 top-0 rounded-[var(--radius-panel)] bg-white p-5 shadow-[0_30px_70px_-30px_rgba(13,24,42,.4),0_0_0_1px_var(--color-ardosia-200)]">
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
        className="absolute bottom-0 right-6 w-[290px] rounded-[var(--radius-panel)] bg-marinho-950 p-5 text-white shadow-[0_30px_60px_-24px_rgba(13,24,42,.6)]"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease, delay: 0.5 }}
      >
        <p className="flex items-center gap-2 text-[0.75rem] text-ardosia-300">
          <ArrowDownToLine className="size-4 text-ciano-500" aria-hidden /> Antecipação
        </p>
        <p className="mt-1 text-[1.375rem] font-bold tracking-[-0.03em]">3 recebimentos</p>
        <p className="mt-3 rounded-xl bg-ciano-500 py-2.5 text-center text-[0.75rem] font-semibold text-marinho-950">
          Simular antecipação
        </p>
        <p className="mt-2 text-[0.625rem] text-ardosia-300">Conforme as condições disponíveis.</p>
      </m.div>
    </div>
  );
}

/* 7. Gestão de transações */
function ManagementMock() {
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

export const solutionMockups: Record<SolutionId, () => React.ReactElement> = {
  gateway: GatewayMock,
  link: LinkMock,
  pix: PixMock,
  credito: CreditMock,
  debito: DebitMock,
  antecipacao: AdvanceMock,
  gestao: ManagementMock,
};
