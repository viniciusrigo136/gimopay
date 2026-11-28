import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Clock, MessageCircle } from "lucide-react";
import { ServiceIcon } from "@/components/brand/icons";
import { mediaUrl } from "@/integrations/supabase/client";
import type { ServiceWithPrices, VehicleCategory } from "@/domain/types";
import { fmtDuration } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { priceDisplay } from "./pricing";

/** Capa do serviço: imagem cadastrada ou composição gráfica neutra (nunca foto falsa). */
export function ServiceCover({ service, className }: { service: ServiceWithPrices; className?: string }) {
  const src = mediaUrl(service.cover_image_path);
  if (src) {
    return <img src={src} alt="" loading="lazy" decoding="async" className={cn("size-full object-cover", className)} />;
  }
  return (
    <div className={cn("relative grid size-full place-items-center overflow-hidden bg-[radial-gradient(ellipse_at_30%_20%,#2e3036,#141518_60%)]", className)} aria-hidden>
      <span className="absolute top-6 left-[-10%] h-0.5 w-[60%] rotate-12 bg-white/40 blur-[1px]" />
      <span className="absolute right-[-10%] bottom-8 h-0.5 w-[50%] -rotate-6 bg-racing-500/60 blur-[1px]" />
      <ServiceIcon category={service.category} className="size-14 text-steel-400/70" strokeWidth={1} />
    </div>
  );
}

export function ServiceCard({ service, categories }: { service: ServiceWithPrices; categories: VehicleCategory[] }) {
  const price = priceDisplay(service, categories);
  return (
    <article className="group relative flex flex-col overflow-hidden rounded-panel bg-graphite-800 ring-1 ring-white/[0.06] transition hover:ring-white/15">
      <div className="aspect-[16/10] overflow-hidden">
        <ServiceCover service={service} className="transition duration-700 group-hover:scale-[1.03]" />
      </div>
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-steel-500">{service.category}</p>
            <h3 className="mt-0.5 text-lg font-bold text-pearl">
              <Link to="/servicos/$slug" params={{ slug: service.slug }} className="after:absolute after:inset-0">
                {service.name}
              </Link>
            </h3>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-steel-500 transition group-hover:text-racing-400" aria-hidden />
        </div>
        <p className="text-sm leading-relaxed text-steel-400">{service.summary}</p>
        <div className="mt-auto flex items-end justify-between gap-3 border-t border-white/5 pt-4">
          <div>
            <p className="text-lg font-extrabold text-pearl">{price.headline}</p>
            {price.isEstimate && !price.isQuote ? <p className="text-xs text-steel-500">Valor final após avaliação</p> : null}
          </div>
          <p className="inline-flex items-center gap-1.5 text-xs font-medium text-steel-400">
            {service.booking_mode === "whatsapp" ? (
              <>
                <MessageCircle className="size-3.5" aria-hidden /> Sob consulta
              </>
            ) : (
              <>
                <Clock className="size-3.5" aria-hidden /> {fmtDuration(service.duration_minutes)}
              </>
            )}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ReferenceNotice({ show }: { show: boolean }) {
  if (!show) return null;
  return (
    <p className="text-xs text-steel-500">
      Valores de referência. O preço final é confirmado pela Tassionero conforme o veículo e o estado de conservação.
    </p>
  );
}
