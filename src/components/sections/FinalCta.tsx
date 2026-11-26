"use client";

import { m, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { WavesGlyph } from "@/components/brand/Waves";
import { copy } from "@/content/copy";

export function FinalCta() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const x = useTransform(scrollYProgress, [0, 1], ["-12%", "10%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.9, 1.12]);

  return (
    <section
      aria-labelledby="cta-final"
      className="bg-[linear-gradient(to_bottom,#fff_55%,var(--color-marinho-950)_55%)] pt-4"
    >
      <div className="container-page">
        <div
          ref={ref}
          className="relative isolate overflow-hidden rounded-[var(--radius-tile)] bg-gradient-to-br from-[#18bce6] via-ciano-500 to-[#0597c8] px-6 py-16 sm:px-12 sm:py-20 lg:px-16 lg:py-24"
        >
          <m.div
            aria-hidden
            style={{ x, scale }}
            className="pointer-events-none absolute -right-[8%] top-1/2 -z-10 -translate-y-1/2 text-white/25"
          >
            <WavesGlyph className="h-[34rem] w-[22rem] sm:h-[44rem] sm:w-[29rem]" strokeWidth={4.2} />
          </m.div>
          <div className="max-w-[44rem]">
            <RevealText
              id="cta-final"
              text={copy.finalCta.title}
              className="text-[clamp(2.25rem,1.3rem+3.6vw,4.25rem)] font-bold leading-[1.03] tracking-[-0.035em] text-marinho-950"
            />
            <p className="mt-6 max-w-[32rem] text-lead font-medium text-marinho-950">{copy.finalCta.text}</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="#contato" variant="ink" size="lg" magnetic>
                {copy.finalCta.primary}
              </ButtonLink>
              <ButtonLink href="#contato" variant="inkOutline" size="lg">
                {copy.finalCta.secondary}
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
