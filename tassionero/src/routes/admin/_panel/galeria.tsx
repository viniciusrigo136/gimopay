import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import type { GalleryItem } from "@/domain/types";
import { mediaUrl } from "@/integrations/supabase/client";
import { cn } from "@/lib/cn";
import { AdminPage, Card } from "@/features/admin/components/AdminPage";
import { adminGalleryQuery, adminKeys, adminServicesQuery, galleryOps } from "@/features/admin/api";

export const Route = createFileRoute("/admin/_panel/galeria")({ component: GalleryAdmin });

function GalleryAdmin() {
  const items = useQuery(adminGalleryQuery);
  const [editing, setEditing] = useState<GalleryItem | "new" | null>(null);
  const qc = useQueryClient();
  const invalidate = () => { void qc.invalidateQueries({ queryKey: adminKeys.all }); void qc.invalidateQueries({ queryKey: ["public"] }); };
  const toggle = useMutation({
    mutationFn: (i: GalleryItem) => galleryOps.save(i.id, { title: i.title, image_path: i.image_path, is_published: !i.is_published }),
    onSuccess: invalidate,
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <AdminPage title="Galeria" subtitle="Fotos reais de trabalhos feitos no estúdio." actions={<Button size="sm" onClick={() => setEditing("new")}><ImagePlus className="size-4" aria-hidden /> Adicionar foto</Button>}>
      <Notice>Use aqui somente fotos de trabalhos reais. Imagens geradas por IA ou de banco devem ser marcadas como <strong className="text-pearl">ilustrativas</strong>.</Notice>
      <Card>
        {items.isPending ? <Skeleton className="h-64" /> : items.isError ? <ErrorState error={items.error} onRetry={() => items.refetch()} /> : items.data.length === 0 ? (
          <EmptyState title="Nenhuma foto ainda" action={<Button onClick={() => setEditing("new")}>Adicionar a primeira</Button>}>A galeria do site fica oculta até você publicar fotos.</EmptyState>
        ) : (
          <ul className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
            {items.data.map((i) => (
              <li key={i.id} className={cn("overflow-hidden rounded-control bg-graphite-900 ring-1 ring-white/10", !i.is_published && "opacity-60")}>
                <button type="button" onClick={() => setEditing(i)} className="block aspect-square w-full">
                  <img src={mediaUrl(i.after_image_path ?? i.image_path) ?? ""} alt={i.title} loading="lazy" className="size-full object-cover" />
                </button>
                <div className="flex items-center justify-between gap-2 p-3">
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{i.title}</span>
                    <span className="text-xs text-steel-500">{i.is_published ? "Publicada" : "Oculta"}{i.is_illustrative ? " · ilustrativa" : ""}</span>
                  </span>
                  <Toggle id={`pub-${i.id}`} checked={i.is_published} onChange={() => toggle.mutate(i)} label="" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {editing ? <GalleryDialog item={editing === "new" ? null : editing} onClose={() => setEditing(null)} onSaved={invalidate} /> : null}
    </AdminPage>
  );
}

function Upload({ label, path, onChange, id }: { label: string; path: string | null; onChange: (p: string | null) => void; id: string }) {
  const [busy, setBusy] = useState(false);
  return (
    <div>
      <p className="label">{label}</p>
      <label htmlFor={id} className={cn("grid aspect-[4/3] cursor-pointer place-items-center overflow-hidden rounded-control bg-graphite-900 text-sm text-steel-400 ring-1 ring-white/10 hover:ring-white/25", busy && "pointer-events-none opacity-50")}>
        {path ? <img src={mediaUrl(path) ?? ""} alt="" className="size-full object-cover" /> : busy ? "Enviando…" : "Escolher imagem"}
      </label>
      <input id={id} type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 8 * 1024 * 1024) { toast.error("Imagem acima de 8 MB. Reduza antes de enviar."); return; }
        setBusy(true);
        try { onChange(await galleryOps.upload(file, "galeria")); } catch (err) { toast.error(errorMessage(err)); } finally { setBusy(false); }
      }} />
      {path ? <button type="button" onClick={() => onChange(null)} className="mt-1 text-xs text-steel-500 hover:text-pearl">Remover</button> : null}
    </div>
  );
}

function GalleryDialog({ item, onClose, onSaved }: { item: GalleryItem | null; onClose: () => void; onSaved: () => void }) {
  const services = useQuery(adminServicesQuery);
  const [f, setF] = useState({
    title: item?.title ?? "", description: item?.description ?? "", image_path: item?.image_path ?? null as string | null,
    before: item?.before_image_path ?? null as string | null, after: item?.after_image_path ?? null as string | null,
    service_id: item?.service_id ?? "", is_illustrative: item?.is_illustrative ?? false, is_published: item?.is_published ?? true, sort_order: String(item?.sort_order ?? 0),
  });
  const save = useMutation({
    mutationFn: () => {
      const main = f.image_path ?? f.after;
      if (!main) throw new Error("Envie ao menos uma imagem.");
      return galleryOps.save(item?.id ?? null, { title: f.title.trim(), description: f.description, image_path: main, before_image_path: f.before, after_image_path: f.after, service_id: f.service_id || null, is_illustrative: f.is_illustrative, is_published: f.is_published, sort_order: Number(f.sort_order) || 0 });
    },
    onSuccess: () => { toast.success("Foto salva."); onSaved(); onClose(); },
    onError: (e) => toast.error(e instanceof Error && !("code" in e) ? e.message : errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: () => galleryOps.remove(item as GalleryItem),
    onSuccess: () => { toast.success("Foto excluída."); onSaved(); onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open onClose={onClose} size="lg" title={item ? "Editar foto" : "Nova foto"}
      footer={<>{item ? <Button variant="danger" className="mr-auto" loading={remove.isPending} onClick={() => { if (window.confirm("Excluir esta foto?")) remove.mutate(); }}><Trash2 className="size-4" aria-hidden /> Excluir</Button> : null}<Button variant="ghost" onClick={onClose}>Cancelar</Button><Button disabled={f.title.trim().length < 2} loading={save.isPending} onClick={() => save.mutate()}>Salvar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-3">
        <Upload id="g-main" label="Imagem principal" path={f.image_path} onChange={(p) => setF({ ...f, image_path: p })} />
        <Upload id="g-before" label="Antes (opcional)" path={f.before} onChange={(p) => setF({ ...f, before: p })} />
        <Upload id="g-after" label="Depois (opcional)" path={f.after} onChange={(p) => setF({ ...f, after: p })} />
        <Field label="Título" htmlFor="g-t" className="sm:col-span-2"><Input id="g-t" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} /></Field>
        <Field label="Ordem" htmlFor="g-o"><Input id="g-o" inputMode="numeric" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} /></Field>
        <Field label="Serviço relacionado" htmlFor="g-s"><Select id="g-s" value={f.service_id} onChange={(e) => setF({ ...f, service_id: e.target.value })}><option value="">Nenhum</option>{(services.data ?? []).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</Select></Field>
        <Field label="Descrição" htmlFor="g-d" className="sm:col-span-2"><Textarea id="g-d" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <div className="flex flex-wrap gap-6 sm:col-span-3">
          <Toggle id="g-p" checked={f.is_published} onChange={(v) => setF({ ...f, is_published: v })} label="Publicada no site" />
          <Toggle id="g-i" checked={f.is_illustrative} onChange={(v) => setF({ ...f, is_illustrative: v })} label="Imagem ilustrativa (não é trabalho real)" />
        </div>
      </div>
    </Dialog>
  );
}
