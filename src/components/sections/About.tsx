import { HeartHandshake, Sparkles, Workflow } from "lucide-react";
import { RevealText } from "@/components/ui/RevealText";
import { FadeIn } from "@/components/motion/FadeIn";
import { SwipeDeck } from "@/components/motion/SwipeDeck";
import { ScrubText } from "./ScrubText";
import { copy } from "@/content/copy";

const icons = [Sparkles, Workflow, HeartHandshake];

export function About() {
  const { about } = copy;
  return (
    <section id="sobre" className="section-y relative">
      <div className="container-page">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          <RevealText text={about.title} className="text-h2 font-bold lg:col-span-6" />

          {/* Desktop: coluna de texto */}
          <div className="hidden space-y-5 text-body lg:col-span-5 lg:col-start-8 lg:block lg:pt-2">
            {about.paragraphs.map((p, i) => (
              <FadeIn key={p} as="p" delay={0.08 * i} className="max-w-[34rem]">
                {p}
              </FadeIn>
            ))}
          </div>

          {/* Mobile: cartões para deslizar */}
          <SwipeDeck label="Sobre a GIMO Pay" className="lg:hidden" itemClassName="flex">
            {about.paragraphs.map((p, i) => {
              const Icon = icons[i];
              return (
                <div key={p} className="flex w-full flex-col rounded-[var(--radius-panel)] bg-nevoa p-6 ring-1 ring-ardosia-200">
                  <span className="grid size-12 place-items-center rounded-[0.875rem] bg-ciano-500 text-marinho-950">
                    <Icon className="size-6" strokeWidth={1.8} aria-hidden />
                  </span>
                  <p className="mt-5 text-[1.0625rem] leading-relaxed text-ardosia-700">{p}</p>
                </div>
              );
            })}
          </SwipeDeck>
        </div>

        <div className="mt-16 border-t border-ardosia-200 pt-12 md:mt-28 md:pt-20">
          <ScrubText
            text={about.statement}
            className="max-w-[18ch] text-[clamp(2.25rem,1rem+5.4vw,5.75rem)] font-bold leading-[1.02] tracking-[-0.04em] text-marinho-800"
          />
        </div>
      </div>
    </section>
  );
}
