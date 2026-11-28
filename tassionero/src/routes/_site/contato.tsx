import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { CalendarCheck, Clock, MapPin, MessageCircle } from "lucide-react";
import { Facebook, Instagram } from "@/components/brand/social";
import { PageHeader } from "@/components/layout/PageHeader";
import { hoursSummary } from "@/components/layout/SiteFooter";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Notice } from "@/components/ui/feedback";
import { msgGeneralContact, waLink } from "@/domain/whatsapp";
import { businessInfoQuery } from "@/features/catalog/queries";
import { fmtPhone } from "@/lib/phone";

export const Route = createFileRoute("/_site/contato")({
  head: () => ({ meta: [{ title: "Contato e localização | Tassionero Estética Automotiva" }] }),
  component: ContactPage,
});

function ContactPage() {
  const { data: info } = useSuspenseQuery(businessInfoQuery);
  const wa = waLink(info.whatsapp_phone, msgGeneralContact());
  return (
    <>
      <PageHeader title="Contato e localização">Fale com a gente pelo WhatsApp ou venha até o estúdio no horário de atendimento.</PageHeader>
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:px-6 md:grid-cols-3">
        <section className="panel p-6" aria-labelledby="c-whats">
          <MessageCircle className="size-6 text-racing-400" aria-hidden />
          <h2 id="c-whats" className="mt-4 text-lg font-bold">WhatsApp</h2>
          {wa ? (
            <>
              <p className="mt-1 text-steel-300">{fmtPhone(info.whatsapp_phone)}</p>
              <ExternalButton href={wa} className="mt-5 w-full">
                Abrir conversa
              </ExternalButton>
            </>
          ) : (
            <Notice className="mt-3">Número em configuração.</Notice>
          )}
        </section>
        <section className="panel p-6" aria-labelledby="c-end">
          <MapPin className="size-6 text-racing-400" aria-hidden />
          <h2 id="c-end" className="mt-4 text-lg font-bold">Endereço</h2>
          <p className="mt-1 text-steel-300">{[info.address, info.city].filter(Boolean).join(" — ") || info.city}</p>
          {info.map_url ? (
            <ExternalButton href={info.map_url} variant="secondary" className="mt-5 w-full">
              Abrir no mapa
            </ExternalButton>
          ) : null}
        </section>
        <section className="panel p-6" aria-labelledby="c-hor">
          <Clock className="size-6 text-racing-400" aria-hidden />
          <h2 id="c-hor" className="mt-4 text-lg font-bold">Horários</h2>
          <dl className="mt-2 space-y-2 text-sm">
            {hoursSummary(info.hours).map((g) => (
              <div key={g.days} className="flex justify-between gap-4">
                <dt className="text-steel-400">{g.days}</dt>
                <dd className="font-semibold">{g.text}</dd>
              </div>
            ))}
          </dl>
          <ButtonLink to="/agendar" className="mt-5 w-full">
            <CalendarCheck className="size-4" aria-hidden /> Agendar online
          </ButtonLink>
        </section>
        {info.booking_policy ? (
          <section className="panel p-6 md:col-span-2" aria-labelledby="c-pol">
            <h2 id="c-pol" className="text-lg font-bold">Política de agendamento e cancelamento</h2>
            <p className="mt-2 text-sm leading-relaxed whitespace-pre-line text-steel-300">{info.booking_policy}</p>
          </section>
        ) : null}
        {info.instagram_url || info.facebook_url ? (
          <section className="panel flex items-center gap-3 p-6" aria-label="Redes sociais">
            {info.instagram_url ? (
              <ExternalButton href={info.instagram_url} variant="secondary">
                <Instagram className="size-4" aria-hidden /> Instagram
              </ExternalButton>
            ) : null}
            {info.facebook_url ? (
              <ExternalButton href={info.facebook_url} variant="secondary">
                <Facebook className="size-4" aria-hidden /> Facebook
              </ExternalButton>
            ) : null}
          </section>
        ) : null}
      </div>
    </>
  );
}
