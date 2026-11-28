import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck, Clock, MessageCircle } from "lucide-react";
import { ButtonLink, ExternalButton } from "@/components/ui/Button";
import { Notice } from "@/components/ui/feedback";
import { msgCheckAvailability, waLink } from "@/domain/whatsapp";
import { PRICING_MODE_LABEL } from "@/domain/status";
import { ServiceCover } from "@/features/catalog/ServiceCard";
import { priceDisplay, priceForCategory } from "@/features/catalog/pricing";
import { businessInfoQuery, categoriesQuery, servicesQuery } from "@/features/catalog/queries";
import { fmtDuration } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";

export const Route = createFileRoute("/_site/servicos/$slug")({
  loader: async ({ context: { queryClient }, params }) => {
    const [services] = await Promise.all([queryClient.ensureQueryData(servicesQuery), queryClient.ensureQueryData(categoriesQuery)]);
    const service = services.find((s) => s.slug === params.slug);
    if (!service) throw notFound();
    return { name: service.name, summary: service.summary };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [{ title: `${loaderData.name} | Tassionero Estética Automotiva` }, { name: "description", content: loaderData.summary }]
      : [],
  }),
  component: ServiceDetail,
});

function ServiceDetail() {
  const { slug } = Route.useParams();
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: info } = useSuspenseQuery(businessInfoQuery);
  const service = services.find((s) => s.slug === slug);
  if (!service) return null;
  const price = priceDisplay(service, categories);
  const byWhatsapp = service.booking_mode === "whatsapp";
  const wa = waLink(info.whatsapp_phone, msgCheckAvailability(service.name));

  return (
    <div className="mx-auto max-w-7xl px-4 pt-28 pb-12 sm:px-6">
      <Link to="/servicos" className="inline-flex items-center gap-2 text-sm font-semibold text-steel-400 hover:text-pearl">
        <ArrowLeft className="size-4" aria-hidden /> Serviços
      </Link>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.15fr_1fr]">
        <div className="aspect-[16/11] overflow-hidden rounded-panel ring-1 ring-white/[0.06]">
          <ServiceCover service={service} />
        </div>
        <div>
          <p className="text-sm font-medium text-steel-500">{service.category}</p>
          <h1 className="mt-1 text-display font-extrabold italic">{service.name}</h1>
          <p className="mt-4 leading-relaxed font-light text-steel-300">{service.description || service.summary}</p>

          <dl className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-control bg-graphite-800 p-4 ring-1 ring-white/[0.06]">
              <dt className="flex items-center gap-1.5 text-xs text-steel-400">
                <Clock className="size-3.5" aria-hidden /> Duração estimada
              </dt>
              <dd className="mt-1 text-xl font-extrabold">{fmtDuration(service.duration_minutes)}</dd>
            </div>
            <div className="rounded-control bg-graphite-800 p-4 ring-1 ring-white/[0.06]">
              <dt className="text-xs text-steel-400">Preço de referência</dt>
              <dd className="mt-1 text-xl font-extrabold">{price.headline}</dd>
            </div>
          </dl>

          {!price.isQuote && service.pricing_mode !== "fixed" ? (
            <table className="mt-6 w-full text-sm">
              <caption className="mb-2 text-left text-xs text-steel-500">{PRICING_MODE_LABEL[service.pricing_mode]}</caption>
              <tbody>
                {categories.map((c) => {
                  const p = priceForCategory(service, c);
                  return (
                    <tr key={c.id} className="border-b border-white/5">
                      <th scope="row" className="py-2.5 text-left font-medium text-steel-300">
                        {c.name}
                      </th>
                      <td className="py-2.5 text-right font-semibold">{p === null ? "Sob avaliação" : fmtMoney(p)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : null}

          {price.isEstimate ? (
            <Notice className="mt-6">O valor final é confirmado pela Tassionero após avaliar o veículo. O preço de referência não é uma cobrança.</Notice>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {byWhatsapp ? (
              wa ? (
                <ExternalButton href={wa} size="lg">
                  <MessageCircle className="size-5" aria-hidden /> Conferir disponibilidade
                </ExternalButton>
              ) : (
                <Notice tone="warn">O WhatsApp ainda não foi configurado. Volte em breve.</Notice>
              )
            ) : (
              <ButtonLink to="/agendar" search={{ servico: service.slug }} size="lg">
                <CalendarCheck className="size-5" aria-hidden /> Agendar este serviço
              </ButtonLink>
            )}
          </div>
          {byWhatsapp ? (
            <p className="mt-3 text-sm text-steel-400">
              Serviço longo: combinamos a data pelo WhatsApp, conforme a agenda e o tempo que o carro precisa ficar no estúdio.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
