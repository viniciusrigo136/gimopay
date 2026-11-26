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
import { useRef, useState } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { IllustrativeBadge } from "@/components/ui/IllustrativeBadge";
import { StepPhone } from "@/components/mockups/PaymentLinkScreens";
import { WavesGlyph } from "@/components/brand/Waves";
import { copy } from "@/content/copy";
import { cn } from "@/lib/cn";
import { EASE_OUT as ease } from "@/lib/motion";

const steps = copy.paymentLink.steps;
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

function ClosingCta() {
  return (
    <div className="flex flex-col gap-5 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
      <p className="max-w-[17rem] text-[0.9375rem] font-medium text-white">{copy.paymentLink.closing}</p>
      <ButtonLink
        href="#contato"
        variant="primary"
        size="lg"
        magnetic
        prefill={{ solution: "link" }}
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
