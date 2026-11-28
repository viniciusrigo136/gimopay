import { Link } from "@tanstack/react-router";
import { MapPin, MessageCircle } from "lucide-react";
import { Facebook, Instagram } from "@/components/brand/social";
import { Logo } from "@/components/brand/Logo";
import type { PublicBusinessInfo } from "@/domain/types";
import { msgGeneralContact, waLink } from "@/domain/whatsapp";
import { WEEKDAYS } from "@/lib/datetime";
import { fmtPhone } from "@/lib/phone";

export function hoursSummary(hours: PublicBusinessInfo["hours"]) {
  // Agrupa dias consecutivos com o mesmo horário: "Segunda a sexta · 08:00–18:00".
  const groups: { from: number; to: number; text: string }[] = [];
  const order = [1, 2, 3, 4, 5, 6, 0];
  for (const wd of order) {
    const h = hours.find((x) => x.weekday === wd);
    const text = h?.is_open ? `${h.opens_at}–${h.closes_at}` : "Fechado";
    const last = groups.at(-1);
    if (last && last.text === text) last.to = wd;
    else groups.push({ from: wd, to: wd, text });
  }
  return groups.map((g) => ({
    days: g.from === g.to ? WEEKDAYS[g.from] : `${WEEKDAYS[g.from]} a ${WEEKDAYS[g.to]?.toLowerCase()}`,
    text: g.text,
  }));
}

export function SiteFooter({ info }: { info: PublicBusinessInfo }) {
  const wa = waLink(info.whatsapp_phone, msgGeneralContact());
  return (
    <footer className="relative mt-24 border-t border-white/5 bg-carbon-2">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-racing-500/60 to-transparent" aria-hidden />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo className="text-[30px]" />
          <p className="max-w-xs text-sm leading-relaxed text-steel-400">{info.public_description}</p>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold text-pearl">Navegação</h2>
          <ul className="space-y-2.5 text-sm text-steel-400">
            <li><Link to="/servicos" className="hover:text-pearl">Serviços e preços</Link></li>
            <li><Link to="/agendar" className="hover:text-pearl">Agendar online</Link></li>
            <li><Link to="/galeria" className="hover:text-pearl">Galeria</Link></li>
            <li><Link to="/contato" className="hover:text-pearl">Contato e localização</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold text-pearl">Horários</h2>
          <dl className="space-y-2.5 text-sm">
            {hoursSummary(info.hours).map((g) => (
              <div key={g.days}>
                <dt className="text-steel-400">{g.days}</dt>
                <dd className="font-semibold text-steel-200">{g.text}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold text-pearl">Contato</h2>
          <ul className="space-y-3 text-sm text-steel-400">
            {wa ? (
              <li>
                <a href={wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 hover:text-pearl">
                  <MessageCircle className="size-4 text-racing-400" aria-hidden /> {fmtPhone(info.whatsapp_phone)}
                </a>
              </li>
            ) : null}
            <li className="inline-flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0 text-racing-400" aria-hidden />
              <span>{[info.address, info.city].filter(Boolean).join(" — ")}</span>
            </li>
            <li className="flex gap-3 pt-1">
              {info.instagram_url ? (
                <a href={info.instagram_url} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid size-9 place-items-center rounded-full ring-1 ring-white/10 hover:ring-racing-500">
                  <Instagram className="size-4" />
                </a>
              ) : null}
              {info.facebook_url ? (
                <a href={info.facebook_url} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="grid size-9 place-items-center rounded-full ring-1 ring-white/10 hover:ring-racing-500">
                  <Facebook className="size-4" />
                </a>
              ) : null}
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-steel-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {new Date().getFullYear()} {info.business_name}. {info.city}.</p>
          <Link to="/admin" className="hover:text-steel-300">Área do proprietário</Link>
        </div>
      </div>
    </footer>
  );
}

export function WhatsAppFab({ phone }: { phone: string }) {
  const href = waLink(phone, msgGeneralContact());
  if (!href) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar no WhatsApp"
      className="fixed right-4 bottom-4 z-30 grid size-14 place-items-center rounded-full bg-whatsapp text-white shadow-[0_12px_30px_-8px_rgb(37_211_102/0.7)] transition hover:scale-105 sm:right-6 sm:bottom-6"
    >
      <MessageCircle className="size-7" aria-hidden />
    </a>
  );
}
