import { Outlet, createFileRoute, useRouterState } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteFooter, WhatsAppFab } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { businessInfoQuery } from "@/features/catalog/queries";

export const Route = createFileRoute("/_site")({
  loader: ({ context }) => context.queryClient.ensureQueryData(businessInfoQuery),
  component: SiteLayout,
});

function SiteLayout() {
  const { data: info } = useSuspenseQuery(businessInfoQuery);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Fluxo de agendamento já tem as próprias ações de WhatsApp; o botão flutuante atrapalharia.
  const showFab = !pathname.startsWith("/agendar") && !pathname.startsWith("/agendamento");
  return (
    <>
      <SiteHeader />
      <main id="conteudo">
        <Outlet />
      </main>
      <SiteFooter info={info} />
      {showFab ? <WhatsAppFab phone={info.whatsapp_phone} /> : null}
    </>
  );
}
