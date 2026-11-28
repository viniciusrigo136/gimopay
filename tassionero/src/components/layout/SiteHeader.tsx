import { useEffect, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/cn";

const NAV = [
  { to: "/", label: "Início" },
  { to: "/servicos", label: "Serviços" },
  { to: "/galeria", label: "Galeria" },
  { to: "/contato", label: "Contato" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fecha o menu ao navegar (ajuste de estado durante a renderização, sem efeito).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-colors duration-300",
        scrolled || open ? "bg-carbon/85 shadow-[0_1px_0_rgb(255_255_255/0.06)] backdrop-blur-md" : "bg-transparent",
      )}
    >
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded focus:bg-pearl focus:px-3 focus:py-2 focus:text-carbon">
        Pular para o conteúdo
      </a>
      <div className="mx-auto flex h-18 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link to="/" className="text-[26px] text-pearl" aria-label="Tassionero — início">
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  activeOptions={{ exact: item.to === "/" }}
                  className="relative rounded-md px-3.5 py-2 text-[13px] font-semibold tracking-wide text-steel-300 transition hover:text-pearl data-[status=active]:text-pearl"
                >
                  {({ isActive }) => (
                    <>
                      {item.label}
                      {isActive ? <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 -skew-x-12 bg-racing-500" aria-hidden /> : null}
                    </>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ButtonLink to="/agendar" size="sm" className="hidden rounded-full px-5 sm:inline-flex">
            <CalendarCheck className="size-4" aria-hidden /> Agendar
          </ButtonLink>
          <button
            type="button"
            className="grid size-11 place-items-center rounded-full text-pearl ring-1 ring-white/15 md:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav id="menu-mobile" aria-label="Principal" className="border-t border-white/5 px-4 pb-6 md:hidden">
          <ul className="flex flex-col py-2">
            {NAV.map((item) => (
              <li key={item.to}>
                <Link to={item.to} activeOptions={{ exact: item.to === "/" }} className="block rounded-md px-2 py-3 text-lg font-semibold text-steel-200 data-[status=active]:text-pearl">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink to="/agendar" size="lg" className="w-full">
            <CalendarCheck className="size-5" aria-hidden /> Agendar serviço
          </ButtonLink>
        </nav>
      ) : null}
    </header>
  );
}
