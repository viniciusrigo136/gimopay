import { ButtonLink } from "@/components/ui/ButtonLink";
import { RevealText } from "@/components/ui/RevealText";
import { FadeIn } from "@/components/motion/FadeIn";
import { IntegrationDiagram } from "./IntegrationDiagram";
import { copy } from "@/content/copy";

export function Integrations() {
  const { integrations } = copy;
  return (
    <section id="integracoes" className="section-y relative overflow-hidden">
      <div
        aria-hidden
        className="pattern-rede pointer-events-none absolute inset-0 text-ciano-200/50 [mask-image:radial-gradient(ellipse_55%_70%_at_70%_50%,black,transparent_75%)]"
      />
      <div className="container-page relative grid items-center gap-y-14 lg:grid-cols-12 lg:gap-x-10">
        <div className="lg:col-span-5">
          <RevealText text={integrations.title} className="text-h2 font-bold" />
          <div className="mt-7 space-y-4">
            {integrations.paragraphs.map((p, i) => (
              <FadeIn key={p} as="p" delay={0.08 * i} className="max-w-[32rem]">
                {p}
              </FadeIn>
            ))}
          </div>
          <div className="mt-9">
            <ButtonLink href="#contato" size="lg" magnetic prefill={{ solution: "Gateway de pagamento" }}>
              {integrations.cta}
            </ButtonLink>
          </div>
        </div>
        <div className="lg:col-span-7">
          <IntegrationDiagram />
        </div>
      </div>
    </section>
  );
}
