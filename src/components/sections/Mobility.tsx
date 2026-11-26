"use client";

import { m, useInView, } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";
import { useRef } from "react";
import { Car, PlugZap, Zap } from "lucide-react";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { copy } from "@/content/copy";
import { site } from "@/config/site";
import icon from "../../../public/brand/gimopay-icon.png";

const ease = [0.16, 1, 0.3, 1] as const;

/** Linha de conexão com pulsos de luz percorrendo o trajeto. */
function Connector({ vertical, delay = 0, active }: { vertical?: boolean; delay?: number; active: boolean }) {
  const reduce = usePrefersReducedMotion();
  return (
    <div
      aria-hidden
      className={
        vertical
          ? "relative mx-auto h-12 w-px bg-white/15 lg:hidden"
          : "relative hidden h-px flex-1 bg-white/15 lg:block"
      }
    >
      {active && !reduce && (
        <m.span
          className={
            vertical
              ? "absolute left-1/2 top-0 h-6 w-[3px] -translate-x-1/2 rounded-full bg-gradient-to-b from-transparent via-ciano-500 to-transparent"
              : "absolute left-0 top-1/2 h-[3px] w-10 -translate-y-1/2 rounded-full bg-gradient-to-r from-transparent via-ciano-500 to-transparent"
          }
          initial={vertical ? { y: "-100%" } : { x: "-100%" }}
          animate={vertical ? { y: ["-100%", "220%"] } : { x: ["-100%", "600%"] }}
          transition={{ repeat: Infinity, duration: 1.6, delay, ease: "easeInOut", repeatDelay: 0.4 }}
        />
      )}
    </div>
  );
}

function Endpoint({ icon: Icon, label }: { icon: typeof Car; label: string }) {
  return (
    <div className="flex shrink-0 flex-col items-center gap-2.5 text-center">
      <span className="grid size-14 place-items-center rounded-full ring-1 ring-white/20">
        <Icon className="size-6 text-white" strokeWidth={1.6} aria-hidden />
      </span>
      <span className="max-w-[9rem] text-[0.8125rem] font-medium text-ardosia-300">{label}</span>
    </div>
  );
}

export function Mobility() {
  const { mobility } = copy;
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.4 });

  const chargeName = site.links.gimoCharge ? (
    <a href={site.links.gimoCharge} target="_blank" rel="noopener noreferrer" className="underline-offset-4 hover:underline">
      GIMO Charge
    </a>
  ) : (
    "GIMO Charge"
  );

  return (
    <section id="mobilidade" className="on-dark section-y relative overflow-hidden bg-marinho-950 text-ardosia-300">
      <div aria-hidden className="pattern-rede pointer-events-none absolute inset-0 text-white/[0.06]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-40 top-1/3 size-[36rem] rounded-full bg-ciano-500/10 blur-3xl"
      />
      <div className="container-page relative">
        <div className="grid gap-y-8 lg:grid-cols-12 lg:gap-x-10">
          <RevealText text={mobility.title} className="text-h2 font-bold text-white lg:col-span-7" />
          <div className="space-y-4 lg:col-span-5 lg:pt-2">
            {mobility.paragraphs.slice(0, 2).map((p) => (
              <p key={p} className="max-w-[32rem]">
                {p}
              </p>
            ))}
          </div>
        </div>

        {/* Fluxo: motorista → GIMO Charge + GIMO Pay → operador */}
        <div ref={ref} className="mt-16 lg:mt-24">
          <div className="flex flex-col items-stretch lg:flex-row lg:items-center lg:gap-6">
            <Endpoint icon={Car} label="Motoristas" />
            <Connector active={inView} />
            <Connector vertical active={inView} />

            <div className="grid gap-4 sm:grid-cols-2 lg:w-[56%] lg:shrink-0">
              <m.div
                className="rounded-[var(--radius-panel)] bg-white/[0.04] p-6 ring-1 ring-white/12"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease }}
              >
                <span className="grid size-12 place-items-center rounded-[0.875rem] bg-white/8 text-ciano-500">
                  <Zap className="size-6" strokeWidth={1.7} aria-hidden />
                </span>
                <p className="mt-5 text-h3 font-semibold text-white">{chargeName}</p>
                <p className="mt-1 text-[0.9375rem]">Tecnologia de gestão das recargas</p>
              </m.div>
              <m.div
                className="relative rounded-[var(--radius-panel)] bg-ciano-500 p-6 text-marinho-950"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.8, ease, delay: 0.12 }}
              >
                <Image src={icon} alt="" className="size-12 rounded-[0.875rem] ring-2 ring-white/50" sizes="48px" />
                <p className="mt-5 text-h3 font-semibold">GIMO Pay</p>
                <p className="mt-1 text-[0.9375rem]">Processamento dos pagamentos</p>
              </m.div>
            </div>

            <Connector active={inView} delay={0.8} />
            <Connector vertical active={inView} delay={0.8} />
            <Endpoint icon={PlugZap} label="Operadores de estações de recarga" />
          </div>
        </div>

        <div className="mt-16 grid gap-y-8 border-t border-white/10 pt-10 lg:mt-20 lg:grid-cols-12 lg:gap-x-10">
          <div className="space-y-3 lg:col-span-7">
            <p className="max-w-[38rem]">{mobility.paragraphs[2]}</p>
            <p className="max-w-[38rem] font-medium text-white">{mobility.closing}</p>
          </div>
          <div className="lg:col-span-5 lg:flex lg:items-start lg:justify-end">
            <ButtonLink href="#contato" variant="onDark" size="lg" magnetic prefill={{ segment: "Mobilidade elétrica" }}>
              {mobility.cta}
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
