"use client";

import { LazyMotion, MotionConfig, domMax } from "motion/react";
import { ReactLenis } from "lenis/react";
import { usePrefersReducedMotion } from "@/lib/usePrefersReducedMotion";

const HEADER_OFFSET = -84;

export function Providers({ children }: { children: React.ReactNode }) {
  const reduce = usePrefersReducedMotion();

  return (
    <ReactLenis
      root
      // Mesma árvore sempre (sem remontar na hidratação); sem suavização para quem prefere menos movimento.
      options={{
        lerp: 0.11,
        smoothWheel: !reduce,
        anchors: reduce ? { offset: HEADER_OFFSET, immediate: true } : { offset: HEADER_OFFSET },
        autoRaf: true,
      }}
    >
      <LazyMotion features={domMax} strict>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </LazyMotion>
    </ReactLenis>
  );
}
