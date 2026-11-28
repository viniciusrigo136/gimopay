/// <reference types="vite/client" />
import type { ReactNode } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { HeadContent, Outlet, Scripts, createRootRouteWithContext } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { MotionProvider } from "@/components/motion/MotionProvider";
import appCss from "@/styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { name: "theme-color", content: "#0b0b0b" },
      { title: "Tassionero Estética Automotiva | União do Oeste/SC" },
      {
        name: "description",
        content:
          "Lavagem detalhada, higienização, polimento e vitrificação em União do Oeste/SC. Veja serviços e preços de referência e agende online.",
      },
      { property: "og:title", content: "Tassionero Estética Automotiva" },
      { property: "og:description", content: "Cuidado em cada detalhe. Agende online." },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "pt_BR" },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap",
      },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
    ],
  }),
  component: RootComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <Outlet />
    </RootDocument>
  );
}

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
      </head>
      <body>
        <MotionProvider>{children}</MotionProvider>
        <Toaster
          theme="dark"
          position="top-center"
          toastOptions={{ classNames: { toast: "!bg-graphite-800 !text-pearl !ring-1 !ring-graphite-600 !font-sans" } }}
        />
        <Scripts />
      </body>
    </html>
  );
}
