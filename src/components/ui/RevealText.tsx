"use client";

import { m, type Variants } from "motion/react";
import { createElement } from "react";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

const container: Variants = {
  hidden: {},
  show: (delay: number = 0) => ({
    transition: { staggerChildren: 0.045, delayChildren: delay },
  }),
};

const word: Variants = {
  hidden: { y: "110%" },
  show: { y: "0%", transition: { duration: 0.85, ease: EASE_OUT } },
};

type Props = {
  as?: "h1" | "h2" | "h3" | "p";
  /** Uma string, ou linhas que devem quebrar exatamente onde indicado. */
  text: string | readonly string[];
  className?: string;
  /** Classe por linha (mesma ordem de `text`). */
  lineClassNames?: readonly (string | undefined)[];
  delay?: number;
  /** Anima no carregamento em vez de ao entrar na tela. */
  onMount?: boolean;
  id?: string;
};

/**
 * Título com revelação palavra a palavra (máscara). O texto completo fica
 * acessível a leitores de tela via aria-label.
 */
export function RevealText({
  as = "h2",
  text,
  className,
  lineClassNames,
  delay = 0,
  onMount = false,
  id,
}: Props) {
  const lines = typeof text === "string" ? [text] : text;
  const trigger = onMount
    ? { animate: "show" }
    : { whileInView: "show", viewport: { once: true, amount: 0.6 } };

  return createElement(
    as,
    { className, id, "aria-label": lines.join(" ") },
    <m.span
      aria-hidden
      className="block"
      variants={container}
      initial="hidden"
      custom={delay}
      {...trigger}
    >
      {lines.map((line, li) => (
        <span key={li} className={cn("block", lineClassNames?.[li])}>
          {line.split(" ").map((w, wi) => (
            <span
              key={wi}
              className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-top"
            >
              <m.span className="inline-block will-change-transform" variants={word}>
                {w}
              </m.span>
              {wi < line.split(" ").length - 1 ? " " : null}
            </span>
          ))}
        </span>
      ))}
    </m.span>,
  );
}
