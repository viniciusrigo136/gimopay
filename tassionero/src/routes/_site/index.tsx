import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowRight, Banknote, CalendarCheck, MapPin, MessageCircle, QrCode, ShieldCheck } from "lucide-react";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { hoursSummary } from "@/components/layout/SiteFooter";
import { msgGeneralContact, waLink } from "@/domain/whatsapp";
import { Hero } from "@/features/catalog/Hero";
import { ReferenceNotice, ServiceCard } from "@/features/catalog/ServiceCard";
import { GalleryGrid } from "@/features/catalog/GalleryGrid";
import { businessInfoQuery, categoriesQuery, galleryQuery, servicesQuery } from "@/features/catalog/queries";

export const Route = createFileRoute("/_site/")({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(servicesQuery),
      queryClient.ensureQueryData(categoriesQuery),
      queryClient.ensureQueryData(galleryQuery),
    ]),
  component: HomePage,
});

function SectionHeading({ id, title, children }: { id: string; title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-2xl">
      <span className="mb-4 block h-1 w-10 -skew-x-[20deg] bg-racing-500" aria-hidden />
      <h2 id={id} className="text-display font-extrabold italic">
        {title}
      </h2>
      {children ? <p className="mt-4 text-base leading-relaxed font-light text-steel-300">{children}</p> : null}
    </div>
  );
}

function HomePage() {
  const { data: info } = useSuspenseQuery(businessInfoQuery);
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: gallery } = useSuspenseQuery(galleryQuery);
  const featured = services.filter((s) => s.is_featured);
  const wa = waLink(info.whatsapp_phone, msgGeneralContact());

  return (
    <>
      <Hero info={info} featured={featured.length ? featured : services} categories={categories} />

      {/* Serviços */}
      <section aria-labelledby="servicos" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-32">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading id="servicos" title="Serviços">
            Do cuidado semanal à proteção da pintura. Cada serviço mostra a duração prevista e o valor de referência por tipo de veículo.
          </SectionHeading>
          <ButtonLink to="/servicos" variant="secondary">
            Todos os serviços <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.slice(0, 6).map((s) => (
            <ServiceCard key={s.id} service={s} categories={categories} />
          ))}
        </div>
        <div className="mt-5">
          <ReferenceNotice show={services.some((s) => s.is_demo || s.pricing_mode !== "fixed")} />
        </div>
      </section>

      {/* Como funciona: sequência real do agendamento */}
      <section aria-labelledby="como-funciona" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-32">
        <SectionHeading id="como-funciona" title="Como funciona o agendamento" />
        <ol className="mt-10 grid gap-px overflow-hidden rounded-panel bg-white/[0.06] md:grid-cols-3">
          {[
            { icon: CalendarCheck, title: "Escolha serviço e horário", text: "Selecione os serviços, informe o veículo e veja só os horários que cabem na agenda." },
            { icon: MessageCircle, title: "Confirmamos pelo WhatsApp", text: "Seu horário fica reservado enquanto conferimos o pedido. A confirmação e o valor final chegam pelo WhatsApp." },
            { icon: ShieldCheck, title: "Traga o carro", text: "No dia, é só trazer o veículo. Pagamento por Pix ou em dinheiro, como você preferir." },
          ].map((step, i) => (
            <li key={step.title} className="relative bg-graphite-900 p-7 md:p-8">
              <span className="text-5xl font-black text-white/[0.07] italic" aria-hidden>
                {i + 1}
              </span>
              <step.icon className="mt-3 size-6 text-racing-400" strokeWidth={1.6} aria-hidden />
              <h3 className="mt-4 text-lg font-bold">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-steel-400">{step.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Galeria (só aparece com itens publicados) */}
      {gallery.length ? (
        <section aria-labelledby="galeria" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-32">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <SectionHeading id="galeria" title="Trabalhos realizados" />
            <ButtonLink to="/galeria" variant="secondary">
              Ver galeria <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
          <div className="mt-10">
            <GalleryGrid items={gallery.slice(0, 6)} />
          </div>
        </section>
      ) : null}

      {/* Pagamento */}
      <section aria-labelledby="pagamento" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-32">
        <div className="grid gap-10 rounded-panel bg-graphite-900 p-7 ring-1 ring-white/[0.06] md:grid-cols-[1.1fr_1fr] md:p-12">
          <SectionHeading id="pagamento" title="Pague do seu jeito, sem surpresa">
            O valor é confirmado antes do serviço. Nenhuma cobrança é feita pelo site.
          </SectionHeading>
          <ul className="grid gap-4 self-center sm:grid-cols-2">
            <li className="rounded-control bg-graphite-800 p-5 ring-1 ring-white/[0.06]">
              <QrCode className="size-6 text-racing-400" aria-hidden />
              <p className="mt-3 font-bold">Pix</p>
              <p className="mt-1 text-sm text-steel-400">Você recebe a chave ao concluir o pedido e envia o comprovante pelo WhatsApp.</p>
            </li>
            <li className="rounded-control bg-graphite-800 p-5 ring-1 ring-white/[0.06]">
              <Banknote className="size-6 text-racing-400" aria-hidden />
              <p className="mt-3 font-bold">Dinheiro</p>
              <p className="mt-1 text-sm text-steel-400">Pagamento presencial, na entrega do veículo.</p>
            </li>
          </ul>
        </div>
      </section>

      {/* Localização e contato */}
      <section aria-labelledby="visite" className="mx-auto max-w-7xl px-4 pt-24 sm:px-6 md:pt-32">
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <SectionHeading id="visite" title="Visite a Tassionero">
              {[info.address, info.city].filter(Boolean).join(" — ")}
            </SectionHeading>
            <dl className="mt-8 grid max-w-sm grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {hoursSummary(info.hours).map((g) => (
                <div key={g.days} className="contents">
                  <dt className="text-steel-400">{g.days}</dt>
                  <dd className="font-semibold">{g.text}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              {wa ? (
                <ExternalButton href={wa}>
                  <MessageCircle className="size-4" aria-hidden /> Falar no WhatsApp
                </ExternalButton>
              ) : null}
              {info.map_url ? (
                <ExternalButton href={info.map_url} variant="secondary">
                  <MapPin className="size-4" aria-hidden /> Abrir no mapa
                </ExternalButton>
              ) : null}
              <Link to="/contato" className="inline-flex h-11 items-center px-2 text-sm font-semibold text-steel-300 hover:text-pearl">
                Mais informações
              </Link>
            </div>
          </div>
          <div className="relative min-h-64 overflow-hidden rounded-panel bg-[radial-gradient(ellipse_at_50%_0%,#2e3036,#101113_70%)] ring-1 ring-white/[0.06]">
            <span className="light-tube absolute top-10 left-[10%] h-[3px] w-[45%] rotate-6" aria-hidden />
            <span className="light-tube absolute top-16 right-[8%] h-[3px] w-[30%] -rotate-3" aria-hidden />
            <div className="absolute inset-x-6 bottom-6">
              <p className="text-sm text-steel-400">Atendimento com hora marcada</p>
              <p className="mt-1 text-2xl font-extrabold italic">Seu carro em boas mãos.</p>
              <ButtonLink to="/agendar" className="mt-5">
                <CalendarCheck className="size-4" aria-hidden /> Agendar agora
              </ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
