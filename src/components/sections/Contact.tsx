import { RevealText } from "@/components/ui/RevealText";
import { WavesGlyph } from "@/components/brand/Waves";
import { ContactForm } from "./ContactForm";
import { copy } from "@/content/copy";

export function Contact() {
  const { contact } = copy;
  return (
    <section id="contato" className="section-y">
      <div className="container-page">
        <div className="on-dark relative overflow-hidden rounded-[var(--radius-tile)] bg-marinho-800 p-3 sm:p-4 lg:p-5">
          <WavesGlyph
            className="pointer-events-none absolute -bottom-24 -left-10 h-[30rem] w-[20rem] text-white/[0.05]"
            strokeWidth={4}
          />
          <div className="relative grid gap-y-10 lg:grid-cols-12 lg:gap-x-6">
            <div className="px-4 pt-8 sm:px-6 lg:col-span-5 lg:px-8 lg:py-12">
              <RevealText text={contact.title} className="text-h2 font-bold text-white" />
              <p className="mt-6 max-w-[28rem] text-lead text-ardosia-300">{contact.intro}</p>
              <p className="mt-6 max-w-[28rem] font-medium text-white">{contact.instruction}</p>
            </div>
            <div className="relative rounded-[calc(var(--radius-tile)-0.5rem)] bg-white p-6 sm:p-8 lg:col-span-7 lg:p-10">
              <ContactForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
