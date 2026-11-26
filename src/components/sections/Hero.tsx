import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { FadeIn } from "@/components/motion/FadeIn";
import { WavesGlyph } from "@/components/brand/Waves";
import { HeroScene } from "./HeroScene";
import { HeroStream } from "./HeroStream";
import { HeroWaves } from "./HeroWaves";
import { copy } from "@/content/copy";

export function Hero() {
  const { hero } = copy;
  return (
    <section id="inicio" className="relative overflow-hidden pb-16 pt-24 md:pt-36 lg:pb-24">
      {/* Padrão de rede da família Gimo, bem sutil */}
      <div
        aria-hidden
        className="pattern-rede pointer-events-none absolute inset-0 text-ciano-200/70 [mask-image:radial-gradient(ellipse_70%_60%_at_75%_35%,black,transparent_75%)]"
      />
      {/* Sinal emitido: arcos do símbolo */}
      <HeroWaves className="-right-16 top-6 h-[15rem] w-[7.5rem] text-ciano-100 sm:right-0 lg:right-[6%] lg:top-[22%] lg:h-[34rem] lg:w-[17rem] lg:text-ciano-100" />

      <div className="container-page relative grid items-center gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-7">
          {/* Mobile: vendas ao vivo dentro da primeira tela */}
          <FadeIn onMount delay={0.05} y={-16} className="mb-7 max-w-[26rem] lg:hidden">
            <HeroStream />
          </FadeIn>

          <FadeIn onMount className="text-[0.9375rem] font-medium text-ciano-700">
            {hero.label}
          </FadeIn>

          <RevealText
            as="h1"
            onMount
            delay={0.1}
            text={hero.titleLines}
            className="mt-3 text-display font-bold sm:mt-5"
            lineClassNames={[undefined, "text-ciano-600"]}
          />

          <FadeIn onMount delay={0.55} className="mt-5 max-w-[34rem] sm:mt-7">
            <p className="text-lead text-ardosia-700">{hero.lead}</p>
          </FadeIn>

          <FadeIn onMount delay={0.7} className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:items-center">
            <ButtonLink href="#contato" size="lg" magnetic>
              {hero.primary}
            </ButtonLink>
            <ButtonLink href="#solucoes" size="lg" variant="secondary">
              {hero.secondary}
            </ButtonLink>
          </FadeIn>

          <FadeIn onMount delay={0.85} className="mt-10 flex max-w-[30rem] items-center gap-3.5 text-[0.9375rem] text-ardosia-500">
            <WavesGlyph className="h-6 w-4 shrink-0 text-ciano-500" strokeWidth={6} />
            <p>{hero.support}</p>
          </FadeIn>
        </div>

        <div className="lg:col-span-5">
          <HeroScene />
        </div>
      </div>
    </section>
  );
}
