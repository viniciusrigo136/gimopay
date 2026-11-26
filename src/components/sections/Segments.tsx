"use client";

import { m } from "motion/react";
import {
  Briefcase,
  Car,
  Cpu,
  Handshake,
  MonitorSmartphone,
  PlugZap,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { RevealText } from "@/components/ui/RevealText";
import { SegmentMarquee } from "@/components/motion/SegmentMarquee";
import { copy, segments, type SegmentId } from "@/content/copy";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

const icons: LucideIcon[] = [Store, Briefcase, Truck, MonitorSmartphone, Cpu, Car, PlugZap, Handshake];
/** Segmentos ligados à seção de mobilidade elétrica: recebem destaque. */
const mobilitySegments = new Set<SegmentId>(["mobilidade", "eletropostos"]);

export function Segments() {
  return (
    <section id="segmentos" className="section-y bg-nevoa">
      <div className="container-page grid gap-y-12 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <RevealText text={copy.segments.title} className="text-h2 font-bold" />
            <p className="mt-6 max-w-[30rem] text-lead">{copy.segments.intro}</p>
          </div>
        </div>

        <div className="min-w-0 lg:col-span-7">
          {/* Mobile: faixas em movimento (a lista abaixo segue disponível para leitores de tela) */}
          <div className="mb-10 md:hidden">
            <SegmentMarquee
              items={segments.map((s, i) => ({
                label: s.label.replace(/\.$/, ""),
                icon: icons[i],
                highlight: mobilitySegments.has(s.id),
              }))}
            />
          </div>
          <m.ul
            className="grid max-md:sr-only sm:grid-cols-2 sm:gap-x-8"
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
            variants={{ show: { transition: { staggerChildren: 0.06 } } }}
          >
            {segments.map((s, i) => {
              const Icon = icons[i];
              const mobility = mobilitySegments.has(s.id);
              return (
                <m.li
                  key={s.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
                  }}
                  className="group relative flex items-center gap-4 border-t border-ardosia-200 py-5"
                >
                  <span
                    aria-hidden
                    className="absolute -top-px left-0 h-px w-0 bg-ciano-500 transition-[width] duration-500 ease-out group-hover:w-full"
                  />
                  <span
                    className={cn(
                      "grid size-12 shrink-0 place-items-center rounded-[0.875rem] transition-transform duration-300 group-hover:-translate-y-0.5",
                      mobility ? "bg-marinho-950 text-ciano-500" : "bg-white text-ciano-700 ring-1 ring-ardosia-200",
                    )}
                  >
                    <Icon className="size-[22px]" strokeWidth={1.7} aria-hidden />
                  </span>
                  <span className="text-[1.0625rem] font-semibold leading-snug tracking-[-0.01em] text-marinho-800">
                    {s.label}
                  </span>
                </m.li>
              );
            })}
          </m.ul>
          <p className="mt-10 max-w-[36rem] border-l-2 border-ciano-500 pl-5 text-body text-ardosia-700">
            {copy.segments.closing}
          </p>
        </div>
      </div>
    </section>
  );
}
