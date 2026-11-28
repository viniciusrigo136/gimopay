import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { CalendarCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/feedback";
import { ReferenceNotice, ServiceCard } from "@/features/catalog/ServiceCard";
import { categoriesQuery, servicesQuery } from "@/features/catalog/queries";
import { cn } from "@/lib/cn";

export const Route = createFileRoute("/_site/servicos/")({
  head: () => ({ meta: [{ title: "Serviços e preços | Tassionero Estética Automotiva" }] }),
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(servicesQuery), queryClient.ensureQueryData(categoriesQuery)]),
  component: CatalogPage,
});

function CatalogPage() {
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const groups = useMemo(() => Array.from(new Set(services.map((s) => s.category).filter(Boolean))), [services]);
  const [group, setGroup] = useState<string | null>(null);
  const visible = group ? services.filter((s) => s.category === group) : services;

  return (
    <>
      <PageHeader
        title="Serviços e preços"
        aside={
          <ButtonLink to="/agendar" size="lg">
            <CalendarCheck className="size-5" aria-hidden /> Agendar
          </ButtonLink>
        }
      >
        Valores de referência por tipo de veículo. Serviços que dependem do estado da pintura ou do interior têm o valor final confirmado após avaliação.
      </PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {groups.length > 1 ? (
          <div role="group" aria-label="Filtrar por tipo de serviço" className="mb-8 flex flex-wrap gap-2">
            {[null, ...groups].map((g) => (
              <button
                key={g ?? "todos"}
                type="button"
                aria-pressed={group === g}
                onClick={() => setGroup(g)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold ring-1 transition",
                  group === g ? "bg-pearl text-carbon ring-pearl" : "text-steel-300 ring-white/15 hover:ring-white/40",
                )}
              >
                {g ?? "Todos"}
              </button>
            ))}
          </div>
        ) : null}
        {visible.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((s) => (
              <ServiceCard key={s.id} service={s} categories={categories} />
            ))}
          </div>
        ) : (
          <EmptyState title="Nenhum serviço disponível no momento">Volte em breve ou fale com a gente pelo WhatsApp.</EmptyState>
        )}
        <div className="mt-6">
          <ReferenceNotice show />
        </div>
      </div>
    </>
  );
}
