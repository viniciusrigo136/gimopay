"use client";

import { AnimatePresence, m, useMotionValueEvent, useScroll } from "motion/react";
import { useLenis } from "lenis/react";
import { useEffect, useState } from "react";
import { CircleUserRound, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { ButtonLink } from "@/components/ui/ButtonLink";
import { copy } from "@/content/copy";
import { site, hasLink } from "@/config/site";
import { cn } from "@/lib/cn";
import { EASE_OUT } from "@/lib/motion";

const sectionIds = copy.nav.items.map((i) => i.href.slice(1));

function useActiveSection(enabled: boolean) {
  const [active, setActive] = useState<string>("inicio");
  useEffect(() => {
    if (!enabled) return;
    const els = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      // Linha de leitura a ~35% da altura da tela.
      { rootMargin: "-35% 0px -64% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return active;
}

export function Header({ onHome = true }: { onHome?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const lenis = useLenis();
  const active = useActiveSection(onHome);

  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > 16));

  useEffect(() => {
    if (open) lenis?.stop();
    else lenis?.start();
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open, lenis]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const hrefFor = (href: string) => (onHome ? href : `/${href}`);

  // No menu mobile a rolagem fica travada; fecha primeiro e só então rola.
  const navigateFromMenu = (e: React.MouseEvent, href: string) => {
    if (!onHome) return setOpen(false);
    e.preventDefault();
    setOpen(false);
    requestAnimationFrame(() => {
      lenis?.start();
      const target = document.querySelector<HTMLElement>(href);
      if (!target) return;
      if (lenis) lenis.scrollTo(target, { offset: -84 });
      else target.scrollIntoView({ behavior: "smooth" });
      history.replaceState(null, "", href);
    });
  };

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,backdrop-filter] duration-300",
          scrolled || open
            ? "bg-white/85 shadow-borda backdrop-blur-xl"
            : "bg-transparent",
        )}
      >
        <div
          className={cn(
            "container-page flex items-center justify-between gap-6 transition-[height] duration-300",
            scrolled ? "h-16" : "h-20",
          )}
        >
          <a href={hrefFor("#inicio")} className="shrink-0 rounded-md" aria-label="GIMO Pay, início">
            <Logo priority className="w-[118px] md:w-[132px]" />
          </a>

          <nav aria-label="Principal" className="hidden xl:block">
            <ul className="flex items-center gap-1">
              {copy.nav.items.map((item) => {
                const id = item.href.slice(1);
                const isActive = onHome && active === id;
                return (
                  <li key={item.href}>
                    <a
                      href={hrefFor(item.href)}
                      aria-current={isActive ? "true" : undefined}
                      className={cn(
                        "relative block rounded-full px-3.5 py-2 text-[0.875rem] font-medium transition-colors",
                        isActive ? "text-marinho-800" : "text-ardosia-700 hover:text-marinho-800",
                      )}
                    >
                      {isActive && (
                        <m.span
                          layoutId="nav-pill"
                          className="absolute inset-0 -z-10 rounded-full bg-ciano-50 ring-1 ring-ciano-100"
                          transition={{ type: "spring", stiffness: 420, damping: 34 }}
                        />
                      )}
                      {item.label}
                    </a>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="flex items-center gap-2">
            {hasLink(site.links.account) && (
              <a
                href={site.links.account}
                className="hidden items-center gap-2 rounded-full px-3 py-2 text-[0.875rem] font-medium text-marinho-800 transition-colors hover:bg-marinho-800/5 md:inline-flex"
              >
                <CircleUserRound className="size-[18px]" strokeWidth={1.8} aria-hidden />
                {copy.nav.account}
              </a>
            )}
            <ButtonLink href={hrefFor("#contato")} className="hidden sm:inline-flex" magnetic>
              {copy.nav.cta}
            </ButtonLink>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label={open ? "Fechar menu" : "Abrir menu"}
              className="grid size-11 place-items-center rounded-full text-marinho-800 transition-colors hover:bg-marinho-800/5 xl:hidden"
            >
              <AnimatePresence initial={false} mode="wait">
                <m.span
                  key={open ? "x" : "menu"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {open ? <X className="size-6" /> : <Menu className="size-6" />}
                </m.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open && (
          <m.div
            id="menu-mobile"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="fixed inset-0 z-40 flex flex-col bg-white pt-20 xl:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            data-lenis-prevent
          >
            <nav aria-label="Principal" className="container-page flex-1 overflow-y-auto pt-6">
              <m.ul
                className="flex flex-col"
                initial="hidden"
                animate="show"
                variants={{ show: { transition: { staggerChildren: 0.05, delayChildren: 0.15 } } }}
              >
                {copy.nav.items.map((item) => (
                  <m.li
                    key={item.href}
                    variants={{
                      hidden: { opacity: 0, y: 24 },
                      show: { opacity: 1, y: 0, transition: { ease: EASE_OUT, duration: 0.6 } },
                    }}
                    className="border-b border-ardosia-200"
                  >
                    <a
                      href={hrefFor(item.href)}
                      onClick={(e) => navigateFromMenu(e, item.href)}
                      className="flex items-center justify-between py-4 text-[1.75rem] font-semibold tracking-[-0.02em] text-marinho-800"
                    >
                      {item.label}
                    </a>
                  </m.li>
                ))}
              </m.ul>
            </nav>
            <m.div
              className="container-page flex flex-col gap-3 pb-8 pt-6"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.45 } }}
            >
              <ButtonLink
                href={hrefFor("#contato")}
                size="lg"
                className="w-full"
                onClick={(e) => navigateFromMenu(e, "#contato")}
              >
                {copy.nav.cta}
              </ButtonLink>
              {hasLink(site.links.account) && (
                <ButtonLink
                  href={site.links.account}
                  variant="secondary"
                  size="lg"
                  className="w-full"
                  icon={<CircleUserRound className="size-5" strokeWidth={1.8} aria-hidden />}
                >
                  {copy.nav.account}
                </ButtonLink>
              )}
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </>
  );
}
