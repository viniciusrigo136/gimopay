"use client";

import {
  AnimatePresence,
  m,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useLenis } from "lenis/react";
import { useEffect, useRef, useState } from "react";
import { Check, CheckCheck, Copy, CreditCard, Link2, Mail, MessageCircle, QrCode, Send } from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { IllustrativeBadge } from "@/components/ui/IllustrativeBadge";
import { ScaleToFit } from "@/components/motion/ScaleToFit";
import { PhoneFrame, StatusBar } from "@/components/mockups/PhoneFrame";
import { WavesGlyph } from "@/components/brand/Waves";
import { copy } from "@/content/copy";
import { formatBRL } from "@/lib/format";
import { cn } from "@/lib/cn";

const steps = copy.paymentLink.steps;
const ease = [0.16, 1, 0.3, 1] as const;

const stepFromProgress = (p: number) =>
  Math.max(0, Math.min(steps.length - 1, Math.floor(p * steps.length * 0.999 + 0.0001)));

/** Rola até o meio do trecho de um passo dentro de uma área fixada. */
function useScrollToStep(ref: React.RefObject<HTMLElement | null>) {
  const lenis = useLenis();
  const reduce = usePrefersReducedMotion();
  return (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + (el.offsetHeight - window.innerHeight) * ((i + 0.5) / steps.length);
    if (lenis) lenis.scrollTo(target, { duration: 1.1 });
    else window.scrollTo({ top: target, behavior: reduce ? "auto" : "smooth" });
  };
}

export function PaymentLink() {
  return (
    <section id="link-de-pagamento" className="on-dark relative bg-marinho-950 text-ardosia-300">
      <div aria-hidden className="pattern-rede pointer-events-none absolute inset-0 text-white/[0.06]" />
      <DesktopStory />
      <MobileStory />
    </section>
  );
}

/* ---------- Celular com as telas de cada passo ---------- */

function StepPhone({ step }: { step: number }) {
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

function ClosingCta() {
  return (
    <div className="flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-[17rem] text-[0.9375rem] font-medium text-white">{copy.paymentLink.closing}</p>
      <ButtonLink
        href="#contato"
        variant="primary"
        size="lg"
        magnetic
        prefill={{ solution: "Link de pagamento" }}
        className="shrink-0 whitespace-nowrap"
      >
        {copy.paymentLink.cta}
      </ButtonLink>
    </div>
  );
}

/* ---------- Desktop: seção fixada, a rolagem conduz os passos ---------- */

function DesktopStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const goTo = useScrollToStep(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const lineScale = useTransform(scrollYProgress, [0, 0.92], [0, 1]);
  useMotionValueEvent(scrollYProgress, "change", (p) => setStep(stepFromProgress(p)));

  return (
    <div ref={ref} className="relative hidden h-[340vh] lg:block">
      <div className="sticky top-0 flex h-screen items-center">
        <div className="container-page relative grid grid-cols-12 gap-x-10">
          <div className="col-span-6 self-center">
            <RevealText text={copy.paymentLink.title} className="text-h2 font-bold text-white" />
            <p className="mt-6 max-w-[32rem] text-lead">{copy.paymentLink.intro}</p>

            <ol className="relative mt-12" aria-label="Como funciona o link de pagamento">
              <span aria-hidden className="absolute bottom-6 left-[1.1875rem] top-6 w-px bg-white/12" />
              <m.span
                aria-hidden
                className="absolute left-[1.1875rem] top-6 w-px origin-top bg-ciano-500"
                style={{ scaleY: lineScale, height: "calc(100% - 3rem)" }}
              />
              {steps.map((s, i) => {
                const on = i === step;
                const done = i < step;
                return (
                  <li key={s.title} className="relative">
                    <button
                      type="button"
                      onClick={() => goTo(i)}
                      aria-current={on ? "step" : undefined}
                      className="group flex w-full gap-5 rounded-2xl py-3 text-left"
                    >
                      <span
                        className={cn(
                          "relative z-10 grid size-10 shrink-0 place-items-center rounded-full text-[0.8125rem] font-semibold tabular-nums ring-1 transition-colors duration-300",
                          on
                            ? "bg-ciano-500 text-marinho-950 ring-ciano-500"
                            : done
                              ? "bg-marinho-950 text-ciano-500 ring-ciano-500"
                              : "bg-marinho-950 text-ardosia-300 ring-white/20",
                        )}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="pt-1.5">
                        <span
                          className={cn(
                            "block text-h3 font-semibold tracking-[-0.015em] transition-colors duration-300",
                            on ? "text-white" : "text-ardosia-300 group-hover:text-white",
                          )}
                        >
                          {s.title}
                        </span>
                        <m.span
                          className="block overflow-hidden"
                          initial={false}
                          animate={{ height: on ? "auto" : 0, opacity: on ? 1 : 0 }}
                          transition={{ duration: 0.45, ease }}
                        >
                          <span className="block max-w-[26rem] pt-1.5 text-body text-ardosia-300">{s.text}</span>
                        </m.span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-10">
              <ClosingCta />
            </div>
          </div>

          <div className="col-span-5 col-start-8 self-center">
            <div className="relative mx-auto max-w-[296px]">
              <div aria-hidden className="absolute -inset-10 rounded-[30%] bg-ciano-500/12 blur-3xl" />
              <StepPhone step={step} />
              <div className="mt-5 flex justify-center">
                <IllustrativeBadge tone="dark" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Mobile: história conduzida pela rolagem, celular fixo na tela ---------- */

function MobileStory() {
  const ref = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const goTo = useScrollToStep(ref);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (p) => setStep(stepFromProgress(p)));
  const s = steps[step];

  return (
    <div className="relative lg:hidden">
      <div className="container-page pt-20 sm:pt-24">
        <RevealText text={copy.paymentLink.title} className="text-h2 font-bold text-white" />
        <p className="mt-5 max-w-[32rem] text-lead">{copy.paymentLink.intro}</p>
      </div>

      <div ref={ref} className="relative h-[420svh]">
        <div className="sticky top-0 flex h-[100svh] flex-col pb-6 pt-[4.75rem]">
          <div className="container-page flex min-h-0 flex-1 flex-col">
            {/* Progresso dos 4 passos */}
            <div className="flex gap-1.5" role="group" aria-label="Passos do link de pagamento">
              {steps.map((st, i) => (
                <button
                  key={st.title}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Passo ${i + 1}: ${st.title}`}
                  aria-current={i === step ? "step" : undefined}
                  className="flex-1 py-2"
                >
                  <ProgressSegment progress={scrollYProgress} index={i} />
                </button>
              ))}
            </div>

            {/* Celular */}
            <div className="relative grid min-h-0 flex-1 place-items-center py-3">
              <m.div
                key={step}
                aria-hidden
                className="absolute left-1/2 top-1/2 size-[17rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-ciano-500/20 blur-3xl"
                initial={{ scale: 0.6, opacity: 0.3 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease }}
              />
              <div
                className="relative"
                style={{ width: "min(70vw, calc((100svh - 20.5rem) * 0.515), 296px)" }}
              >
                <StepPhone step={step} />
              </div>
              <WavesGlyph className="absolute right-0 top-1/3 h-14 w-9 text-ciano-500/70" strokeWidth={5} />
            </div>

            {/* Texto do passo atual */}
            <div className="relative h-[8.75rem]" aria-live="polite">
              <AnimatePresence mode="popLayout" initial={false}>
                <m.div
                  key={step}
                  className="absolute inset-x-0 top-0"
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -18 }}
                  transition={{ duration: 0.45, ease }}
                >
                  <p className="flex items-baseline gap-3">
                    <span className="text-[0.875rem] font-semibold tabular-nums text-ciano-500">
                      {String(step + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[1.625rem] font-bold tracking-[-0.02em] text-white">{s.title}</span>
                  </p>
                  <p className="mt-1.5 max-w-[24rem] text-[1rem] leading-snug">{s.text}</p>
                </m.div>
              </AnimatePresence>
            </div>
            <div className="flex justify-center">
              <IllustrativeBadge tone="dark" />
            </div>
          </div>
        </div>
      </div>

      <div className="container-page pb-20 pt-8 sm:pb-24">
        <ClosingCta />
      </div>
    </div>
  );
}

function ProgressSegment({ progress, index }: { progress: MotionValue<number>; index: number }) {
  const n = steps.length;
  const fill = useTransform(progress, [index / n, (index + 1) / n], [0, 1], { clamp: true });
  return (
    <span className="block h-1 overflow-hidden rounded-full bg-white/15">
      <m.span className="block h-full origin-left rounded-full bg-ciano-500" style={{ scaleX: fill }} />
    </span>
  );
}

/* ---------- Telas demonstrativas (dados fictícios) ---------- */

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
