"use client";

import { m } from "motion/react";
import { Expand, Headset, Layers, MousePointerClick, Plug, ScanEye, type LucideIcon } from "lucide-react";
import { RevealText } from "@/components/ui/RevealText";
import { copy } from "@/content/copy";

const icons: LucideIcon[] = [MousePointerClick, Layers, ScanEye, Plug, Expand, Headset];

export function Differentials() {
  return (
    <section id="diferenciais" className="section-y">
      <div className="container-page">
        <RevealText text={copy.differentials.title} className="max-w-[16ch] text-h2 font-bold" />
        <m.ul
          className="mt-14 grid gap-x-10 gap-y-12 sm:grid-cols-2 lg:mt-20 lg:grid-cols-3"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          variants={{ show: { transition: { staggerChildren: 0.08 } } }}
        >
          {copy.differentials.items.map((d, i) => {
            const Icon = icons[i];
            return (
              <m.li
                key={d.title}
                variants={{
                  hidden: { opacity: 0, y: 24 },
                  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } },
                }}
                whileHover="hover"
                className="group border-t border-ardosia-200 pt-7"
              >
                <m.span
                  className="grid size-14 place-items-center rounded-2xl bg-ciano-50 text-ciano-700 ring-1 ring-ciano-100"
                  variants={{ hover: { rotate: -6, scale: 1.06 } }}
                  transition={{ type: "spring", stiffness: 380, damping: 16 }}
                >
                  <Icon className="size-6" strokeWidth={1.7} aria-hidden />
                </m.span>
                <h3 className="mt-6 text-h3 font-semibold tracking-[-0.015em]">{d.title}</h3>
                <p className="mt-2 max-w-[22rem] text-ardosia-700">{d.text}</p>
              </m.li>
            );
          })}
        </m.ul>
      </div>
    </section>
  );
}
