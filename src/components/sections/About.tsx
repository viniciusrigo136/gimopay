import { RevealText } from "@/components/ui/RevealText";
import { FadeIn } from "@/components/motion/FadeIn";
import { ScrubText } from "./ScrubText";
import { copy } from "@/content/copy";

export function About() {
  const { about } = copy;
  return (
    <section id="sobre" className="section-y relative">
      <div className="container-page">
        <div className="grid gap-y-10 lg:grid-cols-12 lg:gap-x-10">
          <RevealText text={about.title} className="text-h2 font-bold lg:col-span-6" />
          <div className="space-y-5 text-body lg:col-span-5 lg:col-start-8 lg:pt-2">
            {about.paragraphs.map((p, i) => (
              <FadeIn key={p} as="p" delay={0.08 * i} className="max-w-[34rem]">
                {p}
              </FadeIn>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-ardosia-200 pt-14 md:mt-28 md:pt-20">
          <ScrubText
            text={about.statement}
            className="max-w-[18ch] text-[clamp(2.25rem,1rem+5.4vw,5.75rem)] font-bold leading-[1.02] tracking-[-0.04em] text-marinho-800"
          />
        </div>
      </div>
    </section>
  );
}
