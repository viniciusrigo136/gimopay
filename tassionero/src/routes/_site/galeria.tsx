import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Camera } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/feedback";
import { GalleryGrid } from "@/features/catalog/GalleryGrid";
import { galleryQuery } from "@/features/catalog/queries";

export const Route = createFileRoute("/_site/galeria")({
  head: () => ({ meta: [{ title: "Galeria | Tassionero Estética Automotiva" }] }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(galleryQuery),
  component: GalleryPage,
});

function GalleryPage() {
  const { data: items } = useSuspenseQuery(galleryQuery);
  return (
    <>
      <PageHeader title="Galeria">Trabalhos realizados no estúdio, com antes e depois quando houver.</PageHeader>
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {items.length ? (
          <GalleryGrid items={items} />
        ) : (
          <EmptyState title="As primeiras fotos chegam em breve" icon={<Camera className="size-5" />} action={<ButtonLink to="/servicos" variant="secondary">Ver serviços</ButtonLink>}>
            Estamos registrando os trabalhos do estúdio. Enquanto isso, conheça os serviços e os valores de referência.
          </EmptyState>
        )}
      </div>
    </>
  );
}
