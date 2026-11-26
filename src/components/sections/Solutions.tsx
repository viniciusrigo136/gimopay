"use client";

import {
  AnimatePresence,
  animate,
  m,
  useInView,
  useMotionValue,
  useTransform,
} from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useEffect, useRef, useState } from "react";
import {
  ArrowDownToLine,
  BarChart3,
  CreditCard,
  Link2,
  QrCode,
  Wallet,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { IllustrativeBadge } from "@/components/ui/IllustrativeBadge";
import { ScaleToFit } from "@/components/motion/ScaleToFit";
import { solutionMockups } from "@/components/mockups/SolutionMockups";
import { copy, solutions, type SolutionId } from "@/content/copy";
import { cn } from "@/lib/cn";

const icons: Record<SolutionId, LucideIcon> = {
  gateway: Workflow,
  link: Link2,
  pix: QrCode,
  credito: CreditCard,
  debito: Wallet,
  antecipacao: ArrowDownToLine,
  gestao: BarChart3,
};

const AUTOPLAY_MS = 6500;

export function Solutions() {
  const [index, setIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  const reduce = usePrefersReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const progress = useMotionValue(0);
  const progressWidth = useTransform(progress, (v) => `${v * 100}%`);
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);
  const tablistRef = useRef<HTMLDivElement>(null);

  // Mobile: mantém a aba ativa visível na faixa rolável (sem mover a página).
  useEffect(() => {
    const list = tablistRef.current;
    const tab = tabsRef.current[index];
    if (!list || !tab || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({ left: tab.offsetLeft - 20, behavior: reduce ? "auto" : "smooth" });
  }, [index, reduce]);

  const active = solutions[index];
  const Mock = solutionMockups[active.id];

  // Avança sozinho enquanto a seção está visível, até o usuário escolher uma solução.
  useEffect(() => {
    if (!autoplay || reduce || !inView) return;
    progress.set(0);
    const controls = animate(progress, 1, {
      duration: AUTOPLAY_MS / 1000,
      ease: "linear",
      onComplete: () => setIndex((i) => (i + 1) % solutions.length),
    });
    return () => controls.stop();
  }, [index, autoplay, reduce, inView, progress]);

  const select = (i: number, focus = false) => {
    setAutoplay(false);
    setIndex(i);
    if (focus) tabsRef.current[i]?.focus();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const last = solutions.length - 1;
    const map: Record<string, number> = {
      ArrowDown: index === last ? 0 : index + 1,
      ArrowRight: index === last ? 0 : index + 1,
      ArrowUp: index === 0 ? last : index - 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    if (e.key in map) {
      e.preventDefault();
      select(map[e.key], true);
    }
  };

  return (
    <section id="solucoes" ref={sectionRef} className="section-y relative bg-nevoa">
      <div className="container-page">
        <div className="grid gap-y-6 lg:grid-cols-12 lg:items-end lg:gap-x-10">
          <RevealText text={copy.solutions.title} className="text-h2 font-bold lg:col-span-7" />
          <p className="max-w-[30rem] text-lead lg:col-span-4 lg:col-start-9">{copy.solutions.intro}</p>
        </div>

        <div className="mt-14 grid gap-y-8 lg:mt-20 lg:grid-cols-12 lg:gap-x-10">
          {/* Lista de soluções */}
          <div className="min-w-0 lg:col-span-5">
            <div
              ref={tablistRef}
              role="tablist"
              aria-label="Soluções GIMO Pay"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 [scrollbar-width:none] lg:mx-0 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
              data-lenis-prevent-horizontal
            >
              {solutions.map((s, i) => {
                const Icon = icons[s.id];
                const on = i === index;
                return (
                  <button
                    key={s.id}
                    ref={(el) => {
                      tabsRef.current[i] = el;
                    }}
                    role="tab"
                    id={`tab-${s.id}`}
                    aria-selected={on}
                    aria-controls="painel-solucao"
                    tabIndex={on ? 0 : -1}
                    onClick={() => select(i)}
                    className={cn(
                      "group relative shrink-0 snap-start text-left transition-colors",
                      "rounded-full px-4 py-2.5 ring-1 lg:rounded-none lg:px-0 lg:py-5 lg:ring-0",
                      on
                        ? "bg-marinho-950 text-white ring-marinho-950 lg:bg-transparent lg:text-marinho-800"
                        : "bg-white text-ardosia-700 ring-ardosia-200 hover:text-marinho-800 lg:bg-transparent",
                      "lg:border-t lg:border-ardosia-200",
                    )}
                  >
                    {/* Barra de progresso do autoplay (desktop) */}
                    {on && (
                      <span className="absolute inset-x-0 -top-px hidden h-[2px] lg:block" aria-hidden>
                        <m.span
                          className="block h-full bg-ciano-500"
                          style={{ width: autoplay && !reduce ? progressWidth : "100%" }}
                        />
                      </span>
                    )}
                    <span className="flex items-center gap-3 lg:gap-4">
                      <span
                        className={cn(
                          "hidden size-11 shrink-0 place-items-center rounded-[0.875rem] transition-colors lg:grid",
                          on ? "bg-ciano-500 text-marinho-950" : "bg-white text-ciano-700 ring-1 ring-ardosia-200",
                        )}
                      >
                        <Icon className="size-5" strokeWidth={1.8} aria-hidden />
                      </span>
                      <span className="whitespace-nowrap text-[0.9375rem] font-semibold lg:text-h3 lg:tracking-[-0.015em]">
                        {s.name}
                      </span>
                    </span>
                    <AnimatePresence initial={false}>
                      {on && (
                        <m.span
                          className="hidden overflow-hidden lg:block"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <span className="block max-w-[26rem] pl-[3.75rem] pt-2 text-body font-normal text-ardosia-700">
                            {s.description}
                          </span>
                        </m.span>
                      )}
                    </AnimatePresence>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 hidden lg:block">
              <ButtonLink href="#contato" variant="secondary" size="lg">
                {copy.solutions.cta}
              </ButtonLink>
            </div>
          </div>

          {/* Painel com mockup */}
          <div className="min-w-0 lg:col-span-7">
            <div
              id="painel-solucao"
              role="tabpanel"
              aria-labelledby={`tab-${active.id}`}
              className="relative overflow-hidden rounded-[var(--radius-tile)] bg-gradient-to-br from-ciano-100 via-ciano-50 to-white p-5 sm:p-8 lg:sticky lg:top-28"
            >
              <div aria-hidden className="pattern-rede pointer-events-none absolute inset-0 text-ciano-200/60" />
              <p className="relative mb-5 text-body text-ardosia-700 lg:hidden" aria-live="polite">
                {active.description}
              </p>
              <ScaleToFit width={600} height={440}>
                <AnimatePresence mode="wait">
                  <m.div
                    key={active.id}
                    className="h-full w-full"
                    initial={{ opacity: 0, y: 24, scale: 0.98, filter: "blur(6px)" }}
                    animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, y: -16, scale: 0.98, filter: "blur(6px)" }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Mock />
                  </m.div>
                </AnimatePresence>
              </ScaleToFit>
              <div className="relative mt-5 flex justify-end">
                <IllustrativeBadge />
              </div>
            </div>

            <div className="mt-8 lg:hidden">
              <ButtonLink href="#contato" variant="secondary" size="lg" className="w-full">
                {copy.solutions.cta}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
