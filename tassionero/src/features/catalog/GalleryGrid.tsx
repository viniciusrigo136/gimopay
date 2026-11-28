import { useState } from "react";
import { mediaUrl } from "@/integrations/supabase/client";
import type { GalleryItem } from "@/domain/types";
import { Dialog } from "@/components/ui/Dialog";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [open, setOpen] = useState<GalleryItem | null>(null);
  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => setOpen(item)}
              className="group relative block aspect-square w-full overflow-hidden rounded-control bg-graphite-800 ring-1 ring-white/[0.06]"
            >
              <img src={mediaUrl(item.after_image_path ?? item.image_path) ?? ""} alt={item.title} loading="lazy" decoding="async" className="size-full object-cover transition duration-700 group-hover:scale-105" />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-left text-sm font-semibold">
                {item.title}
                {item.is_illustrative ? <span className="mt-0.5 block text-[11px] font-medium text-steel-300">Imagem ilustrativa</span> : null}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <Dialog open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ""} description={open?.description} size="lg">
        {open ? (
          open.before_image_path && open.after_image_path ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <figure>
                <img src={mediaUrl(open.before_image_path) ?? ""} alt={`${open.title} — antes`} className="aspect-[4/3] w-full rounded-control object-cover" />
                <figcaption className="mt-2 text-sm text-steel-400">Antes</figcaption>
              </figure>
              <figure>
                <img src={mediaUrl(open.after_image_path) ?? ""} alt={`${open.title} — depois`} className="aspect-[4/3] w-full rounded-control object-cover" />
                <figcaption className="mt-2 text-sm text-steel-400">Depois</figcaption>
              </figure>
            </div>
          ) : (
            <img src={mediaUrl(open.image_path) ?? ""} alt={open.title} className="w-full rounded-control object-contain" />
          )
        ) : null}
        {open?.is_illustrative ? <p className="mt-3 text-xs text-steel-500">Imagem ilustrativa — não é um trabalho realizado pela Tassionero.</p> : null}
      </Dialog>
    </>
  );
}
