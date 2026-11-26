"use client";

import { AnimatePresence, m } from "motion/react";
import { useState } from "react";
import { RevealText } from "@/components/ui/RevealText";
import { copy } from "@/content/copy";
import { cn } from "@/lib/cn";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="section-y bg-nevoa">
      <div className="container-page grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-4">
          <RevealText text={copy.faq.title} className="text-h2 font-bold lg:sticky lg:top-32" />
        </div>
        <ul className="lg:col-span-8">
          {copy.faq.items.map((item, i) => {
            const isOpen = open === i;
            return (
              <li key={item.q} className="border-b border-ardosia-200 first:border-t">
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                  >
                    <span
                      className={cn(
                        "text-[1.0625rem] font-semibold tracking-[-0.01em] transition-colors sm:text-h3",
                        isOpen ? "text-marinho-800" : "text-marinho-800/85 group-hover:text-marinho-800",
                      )}
                    >
                      {item.q}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "relative grid size-10 shrink-0 place-items-center rounded-full transition-colors duration-300",
                        isOpen ? "bg-ciano-500" : "bg-white ring-1 ring-ardosia-200 group-hover:ring-ciano-500",
                      )}
                    >
                      <span className="absolute h-[2px] w-3.5 rounded-full bg-marinho-950" />
                      <m.span
                        className="absolute h-3.5 w-[2px] rounded-full bg-marinho-950"
                        animate={{ rotate: isOpen ? 90 : 0, opacity: isOpen ? 0 : 1 }}
                        transition={{ type: "spring", stiffness: 400, damping: 26 }}
                      />
                    </span>
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <m.div
                      id={`faq-a-${i}`}
                      role="region"
                      aria-labelledby={`faq-q-${i}`}
                      className="overflow-hidden"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 260, damping: 32 }}
                    >
                      <p className="max-w-[40rem] pb-7 pr-14 text-ardosia-700">{item.a}</p>
                    </m.div>
                  )}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
