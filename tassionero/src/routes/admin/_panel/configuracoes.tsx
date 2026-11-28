import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import type { BusinessHours, BusinessSettings, PixKeyType } from "@/domain/types";
import { WEEKDAYS } from "@/lib/datetime";
import { fmtPhone, maskPhone } from "@/lib/phone";
import { AdminPage, Card } from "@/features/admin/components/AdminPage";
import { adminKeys, hoursQuery, settingsOps, settingsQuery } from "@/features/admin/api";

export const Route = createFileRoute("/admin/_panel/configuracoes")({ component: SettingsPage });

function SettingsPage() {
  const settings = useQuery(settingsQuery);
  const hours = useQuery(hoursQuery);
  if (settings.isPending || hours.isPending) return <Skeleton className="h-[70vh] rounded-panel" />;
  if (settings.isError) return <ErrorState error={settings.error} onRetry={() => settings.refetch()} />;
  if (hours.isError) return <ErrorState error={hours.error} onRetry={() => hours.refetch()} />;
  return (
    <AdminPage title="Configurações" subtitle="Dados públicos da empresa, expediente, Pix e regras da agenda.">
      <SettingsForm key={settings.data.updated_at} initial={settings.data} />
      <HoursForm initial={hours.data} />
    </AdminPage>
  );
}

function SettingsForm({ initial }: { initial: BusinessSettings }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ ...initial, whatsapp_phone: fmtPhone(initial.whatsapp_phone) });
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }));
  const num = (k: "slot_interval_minutes" | "min_advance_minutes" | "max_advance_days" | "max_pending_per_phone" | "pending_alert_hours") => (
    <Input id={k} inputMode="numeric" value={String(f[k])} onChange={(e) => set(k, Number(e.target.value.replace(/\D/g, "")) || 0)} />
  );

  const save = useMutation({
    mutationFn: () => {
      const digits = f.whatsapp_phone.replace(/\D/g, "");
      if (digits && digits.length < 10) throw new Error("invalid_phone");
      const { id: _id, created_at: _c, updated_at: _u, ...rest } = f;
      return settingsOps.save({ ...rest, whatsapp_phone: digits ? `+55${digits.replace(/^55/, "")}` : "" });
    },
    onSuccess: () => {
      toast.success("Configurações salvas.");
      void qc.invalidateQueries({ queryKey: adminKeys.all });
      void qc.invalidateQueries({ queryKey: ["public"] });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); save.mutate(); }} className="space-y-5">
      <Card title="Empresa">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Nome" htmlFor="business_name"><Input id="business_name" value={f.business_name} onChange={(e) => set("business_name", e.target.value)} /></Field>
          <Field label="Slogan" htmlFor="tagline"><Input id="tagline" value={f.tagline} onChange={(e) => set("tagline", e.target.value)} /></Field>
          <Field label="Descrição pública" htmlFor="public_description" className="sm:col-span-2"><Textarea id="public_description" value={f.public_description} onChange={(e) => set("public_description", e.target.value)} /></Field>
          <Field label="WhatsApp comercial" htmlFor="whatsapp_phone" hint="Usado em todos os botões de WhatsApp do site."><Input id="whatsapp_phone" inputMode="tel" value={f.whatsapp_phone} onChange={(e) => set("whatsapp_phone", maskPhone(e.target.value))} placeholder="(49) 99999-9999" /></Field>
          <Field label="Cidade" htmlFor="city"><Input id="city" value={f.city} onChange={(e) => set("city", e.target.value)} /></Field>
          <Field label="Endereço" htmlFor="address"><Input id="address" value={f.address} onChange={(e) => set("address", e.target.value)} /></Field>
          <Field label="Link do mapa" htmlFor="map_url"><Input id="map_url" type="url" value={f.map_url} onChange={(e) => set("map_url", e.target.value)} placeholder="https://maps.app.goo.gl/…" /></Field>
          <Field label="Instagram" htmlFor="instagram_url"><Input id="instagram_url" type="url" value={f.instagram_url} onChange={(e) => set("instagram_url", e.target.value)} /></Field>
          <Field label="Facebook" htmlFor="facebook_url"><Input id="facebook_url" type="url" value={f.facebook_url} onChange={(e) => set("facebook_url", e.target.value)} /></Field>
        </div>
        {!initial.whatsapp_phone ? <Notice tone="warn" className="mt-4">Sem WhatsApp configurado, os botões de contato e o envio de comprovante ficam ocultos no site.</Notice> : null}
      </Card>

      <Card title="Pix e pagamento">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Tipo da chave" htmlFor="pix_key_type">
            <Select id="pix_key_type" value={f.pix_key_type ?? ""} onChange={(e) => set("pix_key_type", (e.target.value || null) as PixKeyType | null)}>
              <option value="">—</option><option value="cpf">CPF</option><option value="cnpj">CNPJ</option><option value="email">E-mail</option><option value="phone">Telefone</option><option value="random">Chave aleatória</option>
            </Select>
          </Field>
          <Field label="Chave Pix" htmlFor="pix_key" hint="Mostrada só ao cliente que escolher Pix, na tela da solicitação."><Input id="pix_key" value={f.pix_key} onChange={(e) => set("pix_key", e.target.value.trim())} /></Field>
          <Field label="Titular (opcional)" htmlFor="pix_holder_name"><Input id="pix_holder_name" value={f.pix_holder_name} onChange={(e) => set("pix_holder_name", e.target.value)} /></Field>
          <Field label="Instruções de pagamento" htmlFor="payment_instructions" className="sm:col-span-3"><Textarea id="payment_instructions" value={f.payment_instructions} onChange={(e) => set("payment_instructions", e.target.value)} /></Field>
          <Field label="Política de agendamento e cancelamento" htmlFor="booking_policy" className="sm:col-span-3"><Textarea id="booking_policy" value={f.booking_policy} onChange={(e) => set("booking_policy", e.target.value)} /></Field>
        </div>
      </Card>

      <Card title="Regras da agenda">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Intervalo entre horários (min)" htmlFor="slot_interval_minutes" hint="Grade oferecida no site. Encaixes após cada reserva são automáticos.">{num("slot_interval_minutes")}</Field>
          <Field label="Antecedência mínima (min)" htmlFor="min_advance_minutes">{num("min_advance_minutes")}</Field>
          <Field label="Antecedência máxima (dias)" htmlFor="max_advance_days">{num("max_advance_days")}</Field>
          <Field label="Pedidos pendentes por telefone" htmlFor="max_pending_per_phone">{num("max_pending_per_phone")}</Field>
          <Field label="Alertar pendência após (horas)" htmlFor="pending_alert_hours">{num("pending_alert_hours")}</Field>
        </div>
      </Card>

      <div className="sticky bottom-3 flex justify-end">
        <Button type="submit" size="lg" className="rounded-control" loading={save.isPending}>Salvar configurações</Button>
      </div>
    </form>
  );
}

function HoursForm({ initial }: { initial: BusinessHours[] }) {
  const qc = useQueryClient();
  const [rows, setRows] = useState(() => [1, 2, 3, 4, 5, 6, 0].map((w) => initial.find((h) => h.weekday === w) ?? { weekday: w, is_open: false, opens_at: null, closes_at: null }));
  const update = (w: number, patch: Partial<BusinessHours>) => setRows((r) => r.map((x) => (x.weekday === w ? { ...x, ...patch } : x)));
  const save = useMutation({
    mutationFn: () => {
      for (const r of rows) if (r.is_open && (!r.opens_at || !r.closes_at || r.closes_at <= r.opens_at)) throw new Error("invalid_range");
      return settingsOps.saveHours(rows.map((r) => ({ ...r, opens_at: r.is_open ? r.opens_at : null, closes_at: r.is_open ? r.closes_at : null })));
    },
    onSuccess: () => { toast.success("Expediente salvo."); void qc.invalidateQueries({ queryKey: adminKeys.all }); void qc.invalidateQueries({ queryKey: ["public"] }); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Card title="Expediente" actions={<Button size="sm" loading={save.isPending} onClick={() => save.mutate()}>Salvar expediente</Button>}>
      <ul className="divide-y divide-white/5">
        {rows.map((r) => (
          <li key={r.weekday} className="flex flex-wrap items-center gap-4 py-3">
            <span className="w-24 font-semibold">{WEEKDAYS[r.weekday]}</span>
            <Toggle id={`open-${r.weekday}`} checked={r.is_open} onChange={(v) => update(r.weekday, { is_open: v, opens_at: r.opens_at ?? "08:00", closes_at: r.closes_at ?? "18:00" })} label={r.is_open ? "Aberto" : "Fechado"} />
            {r.is_open ? (
              <span className="flex items-center gap-2 text-sm">
                <Input type="time" aria-label={`Abertura ${WEEKDAYS[r.weekday]}`} className="w-auto" value={(r.opens_at ?? "").slice(0, 5)} onChange={(e) => update(r.weekday, { opens_at: e.target.value })} />
                às
                <Input type="time" aria-label={`Fechamento ${WEEKDAYS[r.weekday]}`} className="w-auto" value={(r.closes_at ?? "").slice(0, 5)} onChange={(e) => update(r.weekday, { closes_at: e.target.value })} />
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-steel-500">Mudanças valem para novos horários. Agendamentos já marcados não são alterados.</p>
    </Card>
  );
}
