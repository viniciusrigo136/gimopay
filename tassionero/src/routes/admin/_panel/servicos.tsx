import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ImageUp, Plus, Star } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import { PRICING_MODE_LABEL } from "@/domain/status";
import type { BookingMode, PricingMode, ServiceWithPrices, VehicleCategory } from "@/domain/types";
import { fmtDuration } from "@/lib/datetime";
import { fmtMoney, parseMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import { mediaUrl } from "@/integrations/supabase/client";
import { priceDisplay } from "@/features/catalog/pricing";
import { AdminPage, Card } from "@/features/admin/components/AdminPage";
import { adminCategoriesQuery, adminKeys, adminServicesQuery, catalogOps, galleryOps } from "@/features/admin/api";

export const Route = createFileRoute("/admin/_panel/servicos")({ component: ServicesPage });

function slugify(s: string) {
  return s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function ServicesPage() {
  const services = useQuery(adminServicesQuery);
  const categories = useQuery(adminCategoriesQuery);
  const [editing, setEditing] = useState<ServiceWithPrices | "new" | null>(null);
  const [catEdit, setCatEdit] = useState<VehicleCategory | "new" | null>(null);
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: { is_active?: boolean; is_featured?: boolean } }) => catalogOps.toggleService(id, patch),
    onSuccess: () => void qc.invalidateQueries({ queryKey: adminKeys.all }),
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <AdminPage
      title="Serviços"
      subtitle="Preços aqui são de referência. O valor combinado com o cliente fica em cada agendamento."
      actions={<Button size="sm" onClick={() => setEditing("new")}><Plus className="size-4" aria-hidden /> Novo serviço</Button>}
    >
      {services.data?.some((s) => s.is_demo) ? (
        <Notice tone="warn">Serviços marcados como <strong className="text-pearl">referência</strong> vieram da pesquisa de preços médios. Revise nome, duração e valores e salve para remover a marcação.</Notice>
      ) : null}
      <Card bodyClass="p-0">
        {services.isPending || categories.isPending ? <Skeleton className="m-5 h-72" /> : services.isError ? <ErrorState error={services.error} onRetry={() => services.refetch()} className="m-5" /> : services.data.length === 0 ? (
          <div className="p-5"><EmptyState title="Nenhum serviço cadastrado" action={<Button onClick={() => setEditing("new")}>Cadastrar serviço</Button>} /></div>
        ) : (
          <ul className="divide-y divide-white/5">
            {services.data.map((s) => (
              <li key={s.id} className={cn("flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:px-5", !s.is_active && "opacity-60")}>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {s.name}
                    {s.is_demo ? <span className="ml-2 rounded-full bg-warn/15 px-2 py-0.5 text-[11px] font-semibold text-warn">referência</span> : null}
                    {s.booking_mode === "whatsapp" ? <span className="ml-2 rounded-full bg-whatsapp/15 px-2 py-0.5 text-[11px] font-semibold text-whatsapp">WhatsApp</span> : null}
                  </p>
                  <p className="text-sm text-steel-400">{s.category} · {fmtDuration(s.duration_minutes)} · {PRICING_MODE_LABEL[s.pricing_mode]} · {priceDisplay(s, categories.data ?? []).headline}</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" aria-pressed={s.is_featured} aria-label="Destaque no site" title="Destaque no site" onClick={() => toggle.mutate({ id: s.id, patch: { is_featured: !s.is_featured } })} className={cn("grid size-9 place-items-center rounded-full ring-1 ring-white/10", s.is_featured ? "text-warn" : "text-steel-500")}>
                    <Star className="size-4" fill={s.is_featured ? "currentColor" : "none"} />
                  </button>
                  <Toggle id={`act-${s.id}`} checked={s.is_active} onChange={(v) => toggle.mutate({ id: s.id, patch: { is_active: v } })} label="Ativo" />
                  <Button size="sm" variant="secondary" onClick={() => setEditing(s)}>Editar</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="Categorias de veículo" actions={<Button size="sm" variant="ghost" onClick={() => setCatEdit("new")}><Plus className="size-4" aria-hidden /> Nova</Button>}>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {(categories.data ?? []).map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setCatEdit(c)} className={cn("w-full rounded-control bg-graphite-900 p-3 text-left ring-1 ring-white/10 hover:ring-white/25", !c.is_active && "opacity-50")}>
                <span className="block font-semibold">{c.name}</span>
                <span className="block text-xs text-steel-400">{c.is_quote_only ? "Sempre sob avaliação" : c.description || "—"}</span>
              </button>
            </li>
          ))}
        </ul>
      </Card>

      {editing ? <ServiceDialog service={editing === "new" ? null : editing} categories={categories.data ?? []} onClose={() => setEditing(null)} /> : null}
      {catEdit ? <CategoryDialog category={catEdit === "new" ? null : catEdit} onClose={() => setCatEdit(null)} /> : null}
    </AdminPage>
  );
}

function ServiceDialog({ service, categories, onClose }: { service: ServiceWithPrices | null; categories: VehicleCategory[]; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({
    name: service?.name ?? "",
    slug: service?.slug ?? "",
    summary: service?.summary ?? "",
    description: service?.description ?? "",
    category: service?.category ?? "",
    duration: String(service?.duration_minutes ?? 60),
    pricing_mode: (service?.pricing_mode ?? "vehicle_category") as PricingMode,
    base_price: service?.base_price === null || service?.base_price === undefined ? "" : String(service.base_price).replace(".", ","),
    booking_mode: (service?.booking_mode ?? "online") as BookingMode,
    sort_order: String(service?.sort_order ?? 0),
    internal_notes: service?.internal_notes ?? "",
    cover_image_path: service?.cover_image_path ?? null,
  });
  const [prices, setPrices] = useState<Record<string, string>>(() =>
    Object.fromEntries(categories.map((c) => {
      const p = service?.service_category_prices.find((x) => x.vehicle_category_id === c.id);
      return [c.id, p ? String(p.price).replace(".", ",") : ""];
    })),
  );
  const [uploading, setUploading] = useState(false);
  const set = (k: keyof typeof f, v: string | null) => setF((x) => ({ ...x, [k]: v }));
  const usesCategory = f.pricing_mode === "vehicle_category" || f.pricing_mode === "mixed";
  const usesBase = f.pricing_mode === "fixed" || f.pricing_mode === "mixed";

  const save = useMutation({
    mutationFn: () => {
      const duration = Number(f.duration);
      if (f.name.trim().length < 2) throw new Error("Informe o nome.");
      if (!Number.isInteger(duration) || duration < 5 || duration > 720) throw new Error("Duração entre 5 e 720 minutos.");
      const base = f.base_price.trim() ? parseMoney(f.base_price) : null;
      if (f.pricing_mode === "fixed" && base === null) throw new Error("Preço fixo exige um valor.");
      return catalogOps.saveService(
        service?.id ?? null,
        {
          name: f.name.trim(),
          slug: f.slug || slugify(f.name),
          summary: f.summary.trim(),
          description: f.description.trim(),
          category: f.category.trim(),
          duration_minutes: duration,
          pricing_mode: f.pricing_mode,
          base_price: usesBase ? base : null,
          booking_mode: f.booking_mode,
          sort_order: Number(f.sort_order) || 0,
          internal_notes: f.internal_notes,
          cover_image_path: f.cover_image_path,
          is_demo: false,
        },
        categories.filter((c) => !c.is_quote_only).map((c) => ({ vehicle_category_id: c.id, price: usesCategory && prices[c.id]?.trim() ? parseMoney(prices[c.id] ?? "") : null })),
      );
    },
    onSuccess: () => {
      toast.success("Serviço salvo.");
      void qc.invalidateQueries({ queryKey: adminKeys.all });
      void qc.invalidateQueries({ queryKey: ["public"] });
      onClose();
    },
    onError: (e) => toast.error(e instanceof Error && !("code" in e) ? e.message : errorMessage(e)),
  });

  const upload = async (file: File) => {
    setUploading(true);
    try {
      set("cover_image_path", await galleryOps.upload(file, "servicos"));
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open onClose={onClose} size="lg" title={service ? "Editar serviço" : "Novo serviço"}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Salvar serviço</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Nome" htmlFor="sv-n"><Input id="sv-n" value={f.name} onChange={(e) => { set("name", e.target.value); if (!service) set("slug", slugify(e.target.value)); }} /></Field>
        <Field label="Endereço (slug)" htmlFor="sv-s" hint={`/servicos/${f.slug || "…"}`}><Input id="sv-s" value={f.slug} onChange={(e) => set("slug", slugify(e.target.value))} /></Field>
        <Field label="Categoria do serviço" htmlFor="sv-c" hint="Ex.: Lavagem, Interior, Pintura, Proteção"><Input id="sv-c" value={f.category} onChange={(e) => set("category", e.target.value)} /></Field>
        <Field label="Duração (minutos)" htmlFor="sv-d"><Input id="sv-d" inputMode="numeric" value={f.duration} onChange={(e) => set("duration", e.target.value.replace(/\D/g, ""))} /></Field>
        <Field label="Resumo (catálogo)" htmlFor="sv-r" className="sm:col-span-2"><Input id="sv-r" maxLength={140} value={f.summary} onChange={(e) => set("summary", e.target.value)} /></Field>
        <Field label="Descrição" htmlFor="sv-de" className="sm:col-span-2"><Textarea id="sv-de" value={f.description} onChange={(e) => set("description", e.target.value)} /></Field>
        <Field label="Modalidade de preço" htmlFor="sv-pm">
          <Select id="sv-pm" value={f.pricing_mode} onChange={(e) => set("pricing_mode", e.target.value)}>
            {(Object.keys(PRICING_MODE_LABEL) as PricingMode[]).map((k) => <option key={k} value={k}>{PRICING_MODE_LABEL[k]}</option>)}
          </Select>
        </Field>
        <Field label="Agendamento" htmlFor="sv-bm" hint="Serviços longos: o site mostra “Conferir disponibilidade” no WhatsApp.">
          <Select id="sv-bm" value={f.booking_mode} onChange={(e) => set("booking_mode", e.target.value)}>
            <option value="online">Online no site</option>
            <option value="whatsapp">Pelo WhatsApp</option>
          </Select>
        </Field>
        {usesBase ? <Field label={f.pricing_mode === "mixed" ? "Preço base (quando não há preço da categoria)" : "Preço"} htmlFor="sv-bp"><Input id="sv-bp" inputMode="decimal" value={f.base_price} onChange={(e) => set("base_price", e.target.value)} placeholder="0,00" /></Field> : null}
        <Field label="Ordem de exibição" htmlFor="sv-o"><Input id="sv-o" inputMode="numeric" value={f.sort_order} onChange={(e) => set("sort_order", e.target.value.replace(/[^\d-]/g, ""))} /></Field>
        {usesCategory ? (
          <fieldset className="sm:col-span-2">
            <legend className="label">Preço por categoria de veículo (vazio = sob avaliação)</legend>
            <div className="grid gap-3 sm:grid-cols-4">
              {categories.filter((c) => !c.is_quote_only).map((c) => (
                <Field key={c.id} label={c.name} htmlFor={`pr-${c.id}`}>
                  <Input id={`pr-${c.id}`} inputMode="decimal" value={prices[c.id] ?? ""} onChange={(e) => setPrices((p) => ({ ...p, [c.id]: e.target.value }))} placeholder="—" />
                </Field>
              ))}
            </div>
            {categories.some((c) => c.is_quote_only) ? <p className="mt-2 text-xs text-steel-500">{categories.filter((c) => c.is_quote_only).map((c) => c.name).join(", ")}: sempre sob avaliação.</p> : null}
          </fieldset>
        ) : null}
        <div className="sm:col-span-2">
          <p className="label">Foto de capa</p>
          <div className="flex items-center gap-4">
            <div className="h-20 w-32 overflow-hidden rounded-control bg-graphite-900 ring-1 ring-white/10">
              {f.cover_image_path ? <img src={mediaUrl(f.cover_image_path) ?? ""} alt="" className="size-full object-cover" /> : null}
            </div>
            <label className={cn("inline-flex h-9 cursor-pointer items-center gap-2 rounded-control bg-graphite-700 px-3 text-sm font-semibold ring-1 ring-graphite-600 hover:bg-graphite-600", uploading && "pointer-events-none opacity-50")}>
              <ImageUp className="size-4" aria-hidden /> {uploading ? "Enviando…" : "Enviar imagem"}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" className="sr-only" onChange={(e) => { const file = e.target.files?.[0]; if (file) void upload(file); }} />
            </label>
            {f.cover_image_path ? <Button size="sm" variant="ghost" onClick={() => set("cover_image_path", null)}>Remover</Button> : null}
          </div>
        </div>
        <Field label="Observações internas" htmlFor="sv-in" className="sm:col-span-2"><Input id="sv-in" value={f.internal_notes} onChange={(e) => set("internal_notes", e.target.value)} /></Field>
        {service ? <p className="text-xs text-steel-500 sm:col-span-2">Alterações valem para novos pedidos. Agendamentos existentes mantêm duração e preço gravados. Preço atual: {fmtMoney(service.base_price)}.</p> : null}
      </div>
    </Dialog>
  );
}

function CategoryDialog({ category, onClose }: { category: VehicleCategory | null; onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ name: category?.name ?? "", description: category?.description ?? "", is_quote_only: category?.is_quote_only ?? false, is_active: category?.is_active ?? true, sort_order: String(category?.sort_order ?? 0) });
  const save = useMutation({
    mutationFn: () => catalogOps.saveCategory(category?.id ?? null, { name: f.name.trim(), slug: category?.slug ?? slugify(f.name), description: f.description, is_quote_only: f.is_quote_only, is_active: f.is_active, sort_order: Number(f.sort_order) || 0 }),
    onSuccess: () => { toast.success("Categoria salva."); void qc.invalidateQueries({ queryKey: adminKeys.all }); void qc.invalidateQueries({ queryKey: ["public"] }); onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open onClose={onClose} size="sm" title={category ? "Editar categoria" : "Nova categoria"} footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={save.isPending} onClick={() => save.mutate()}>Salvar</Button></>}>
      <div className="space-y-4">
        <Field label="Nome" htmlFor="ct-n"><Input id="ct-n" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></Field>
        <Field label="Exemplos (exibidos no agendamento)" htmlFor="ct-d"><Input id="ct-d" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Ordem" htmlFor="ct-o"><Input id="ct-o" inputMode="numeric" value={f.sort_order} onChange={(e) => setF({ ...f, sort_order: e.target.value })} /></Field>
        <Toggle id="ct-q" checked={f.is_quote_only} onChange={(v) => setF({ ...f, is_quote_only: v })} label="Sempre sob avaliação" />
        <Toggle id="ct-a" checked={f.is_active} onChange={(v) => setF({ ...f, is_active: v })} label="Ativa" />
      </div>
    </Dialog>
  );
}
