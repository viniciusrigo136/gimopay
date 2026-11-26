"use client";

import { m } from "motion/react";

type Props = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  /** Anima no carregamento; caso contrário, ao entrar na tela. */
  onMount?: boolean;
  as?: "div" | "p" | "li" | "span";
};

export function FadeIn({ children, className, delay = 0, y = 18, onMount, as = "div" }: Props) {
  const Comp = m[as];
  const target = { opacity: 1, y: 0 };
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      {...(onMount
        ? { animate: target }
        : { whileInView: target, viewport: { once: true, amount: 0.4 } })}
      transition={{ duration: 0.9, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </Comp>
  );
}
