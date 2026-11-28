import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, CalendarClock, MessageCircle, Pencil, Plus, Undo2 } from "lucide-react";
import { Button, ExternalButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { ErrorState, Notice, Skeleton, Spinner } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea, Toggle } from "@/components/ui/fields";
import { StatusChip } from "@/components/ui/StatusChip";
import { errorMessage } from "@/domain/errors";
import { BOOKING_METHOD_LABEL, MONEY_METHOD_LABEL, PAYMENT_STATUS_LABEL, STATUS_LABEL } from "@/domain/status";
import type { AppointmentStatus, MoneyMethod } from "@/domain/types";
import { msgOwnerConfirmation, waLink } from "@/domain/whatsapp";
import { capFirst, fmtDateLong, fmtDateTime, fmtDuration, fmtSince, fmtTime, localDateOf, localToIso, todayLocal } from "@/lib/datetime";
import { fmtMoney, parseMoney } from "@/lib/money";
import { fmtPhone } from "@/lib/phone";
import { cn } from "@/lib/cn";
import { AdminPage, Card } from "@/features/admin/components/AdminPage";
import { StatusActions } from "@/features/admin/components/StatusActions";
import { adminKeys, appointmentQuery, ownerOps, settingsQuery, type AppointmentDetail } from "@/features/admin/api";

export const Route = createFileRoute("/admin/_panel/agendamentos/$id")({ component: AppointmentPage });

const HISTORY_LABEL = { created: "Criado", status: "Status", reschedule: "Reagendado", price: "Valor final", payment: "Pagamento", note: "Nota" } as const;

function AppointmentPage() {
  const { id } = Route.useParams();
  const q = useQuery(appointmentQuery(id));
  const settings = useQuery(settingsQuery);

  if (q.isPending) return <Skeleton className="h-[70vh] rounded-panel" />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const a = q.data;
  const duration = Math.round((new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000);
  const target = a.final_total ?? a.reference_total;
  const s = settings.data;
  const waMsg = msgOwnerConfirmation({
    customerName: a.customer_name_snapshot,
    services: a.appointment_items.map((i) => i.service_name_snapshot),
    vehicle: a.vehicle_snapshot,
    startsAt: a.starts_at,
    durationMinutes: duration,
    finalTotal: a.final_total === null ? null : Number(a.final_total),
    referenceTotal: a.reference_total === null ? null : Number(a.reference_total),
    paymentMethod: a.payment_method,
    pix: s ? { key: s.pix_key, holderName: s.pix_holder_name } : null,
    code: a.public_code,
  });
  const wa = waLink(a.customer_phone_snapshot, waMsg);

  return (
    <AdminPage
      title={a.customer_name_snapshot}
      subtitle={
        <span className="inline-flex flex-wrap items-center gap-2">
          <span className="font-mono">{a.public_code}</span> · {a.source === "site" ? "Pedido do site" : "Criado no painel"} {fmtSince(a.created_at)}
        </span>
      }
      actions={
        <Link to="/admin/agendamentos" className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel-400 hover:text-pearl">
          <ArrowLeft className="size-4" aria-hidden /> Agendamentos
        </Link>
      }
    >
      <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <div className="space-y-5">
          <Card>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <StatusChip status={a.status} />
                <p className="mt-3 text-2xl font-extrabold">{capFirst(fmtDateLong(a.starts_at))}</p>
                <p className="text-steel-300">
                  {fmtTime(a.starts_at)} às {fmtTime(a.ends_at)}
                  {localDateOf(a.ends_at) !== localDateOf(a.starts_at) ? ` (${fmtDateTime(a.ends_at)})` : ""} · {fmtDuration(duration)}
                </p>
              </div>
              <RescheduleButton appt={a} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2 border-t border-white/5 pt-5">
              <StatusActions id={a.id} status={a.status} size="md" />
            </div>
            {a.status === "pending" ? (
              <Notice tone="warn" className="mt-4">
                Este pedido bloqueia o horário até você confirmar ou recusar. Ele não expira sozinho.
              </Notice>
            ) : null}
          </Card>

          <Card title="WhatsApp">
            <p className="text-sm text-steel-400">A mensagem abre no WhatsApp para você revisar e enviar. Depois de enviar, marque o agendamento como confirmado.</p>
            <pre className="mt-3 max-h-56 overflow-auto rounded-control bg-graphite-900 p-4 font-sans text-xs whitespace-pre-wrap text-steel-300 ring-1 ring-white/10">{waMsg}</pre>
            {a.final_total === null && a.reference_total === null ? <p className="mt-2 text-xs text-warn">Defina o valor final antes de enviar, se já tiver avaliado.</p> : null}
            {wa ? (
              <ExternalButton href={wa} className="mt-4 bg-whatsapp text-carbon shadow-none hover:bg-whatsapp/90">
                <MessageCircle className="size-4" aria-hidden /> Abrir WhatsApp com a mensagem
              </ExternalButton>
            ) : null}
          </Card>

          <Card title="Serviços">
            <ul className="divide-y divide-white/5 text-sm">
              {a.appointment_items.map((i) => (
                <li key={i.id} className="flex justify-between gap-4 py-2.5">
                  <span>
                    {i.service_name_snapshot} <span className="text-steel-500">· {fmtDuration(i.duration_minutes_snapshot)}</span>
                  </span>
                  <span className="text-steel-300">{i.reference_price_snapshot === null ? "Sob avaliação" : fmtMoney(i.reference_price_snapshot)}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-steel-500">Valores e durações gravados no momento do pedido; mudanças no catálogo não alteram este histórico.</p>
          </Card>

          <NotesCard appt={a} />
        </div>

        <div className="space-y-5">
          <Card title="Cliente e veículo">
            <dl className="space-y-2.5 text-sm">
              <Row k="Nome" v={a.customers ? <Link to="/admin/clientes/$id" params={{ id: a.customers.id }} className="font-semibold underline-offset-4 hover:underline">{a.customers.name}</Link> : a.customer_name_snapshot} />
              <Row k="WhatsApp" v={fmtPhone(a.customer_phone_snapshot)} />
              <Row k="Veículo" v={a.vehicle_snapshot} />
              {a.customer_notes ? <Row k="Observação do cliente" v={a.customer_notes} /> : null}
            </dl>
          </Card>

          <PaymentCard appt={a} target={target === null ? null : Number(target)} />

          <Card title="Histórico">
            <ol className="space-y-3 text-sm">
              {a.appointment_history.map((h) => (
                <li key={h.id} className="relative pl-4">
                  <span className="absolute top-1.5 left-0 size-1.5 rounded-full bg-steel-500" aria-hidden />
                  <p>
                    <span className="font-semibold">{HISTORY_LABEL[h.kind]}</span>
                    {h.kind === "status" ? `: ${h.old_value ? STATUS_LABEL[h.old_value as AppointmentStatus] : ""} → ${STATUS_LABEL[h.new_value as AppointmentStatus]}` : null}
                    {h.kind === "price" ? `: ${fmtMoney(h.old_value)} → ${fmtMoney(h.new_value)}` : null}
                    {h.kind === "reschedule" && h.new_value ? `: ${fmtDateTime(h.new_value)}` : null}
                    {h.kind === "payment" && h.new_value ? `: ${fmtMoney(h.new_value)}` : null}
                  </p>
                  {h.note ? <p className="text-steel-400">{h.note}</p> : null}
                  <p className="text-xs text-steel-500">{fmtDateTime(h.created_at)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </AdminPage>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-steel-400">{k}</dt>
      <dd className="text-right">{v}</dd>
    </div>
  );
}

function useInvalidate() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: adminKeys.all });
}

function RescheduleButton({ appt }: { appt: AppointmentDetail }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(localDateOf(appt.starts_at));
  const [slot, setSlot] = useState("");
  const [manual, setManual] = useState(false);
  const [manualStart, setManualStart] = useState(`${localDateOf(appt.starts_at)}T${fmtTime(appt.starts_at)}`);
  const [note, setNote] = useState("");
  const invalidate = useInvalidate();
  const duration = Math.round((new Date(appt.ends_at).getTime() - new Date(appt.starts_at).getTime()) / 60000);
  const slots = useQuery({
    queryKey: ["admin", "slots", date, duration, appt.id],
    enabled: open && !manual,
    queryFn: () => ownerOps.availableSlots(date, Math.max(duration, appt.appointment_items.reduce((s, i) => s + i.duration_minutes_snapshot, 0)), appt.id),
  });
  const m = useMutation({
    mutationFn: () => ownerOps.reschedule(appt.id, manual ? localToIso(manualStart.slice(0, 10), manualStart.slice(11, 16)) : slot, manual, note),
    onSuccess: () => {
      toast.success("Agendamento reagendado.");
      setOpen(false);
      void invalidate();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  if (!["pending", "confirmed"].includes(appt.status)) return null;
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <CalendarClock className="size-4" aria-hidden /> Reagendar
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title="Reagendar"
        description={`Duração mantida: ${fmtDuration(duration)}. O banco verifica conflitos antes de salvar.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button disabled={manual ? !manualStart : !slot} loading={m.isPending} onClick={() => m.mutate()}>Salvar novo horário</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Toggle id="rs-manual" checked={manual} onChange={setManual} label="Definir horário manualmente (fora do expediente)" />
          {manual ? (
            <Field label="Novo início" htmlFor="rs-ms"><Input id="rs-ms" type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} /></Field>
          ) : (
            <>
              <Field label="Data" htmlFor="rs-date" className="max-w-xs"><Input id="rs-date" type="date" min={todayLocal()} value={date} onChange={(e) => { setDate(e.target.value); setSlot(""); }} /></Field>
              {slots.isPending ? <Spinner label="Buscando horários" /> : slots.isError ? <ErrorState error={slots.error} /> : slots.data.length ? (
                <div className="flex flex-wrap gap-2">
                  {slots.data.map((s) => (
                    <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cn("h-9 rounded-control px-3 text-sm font-semibold ring-1", slot === s ? "bg-racing-500 text-white ring-racing-500" : "ring-white/15 hover:ring-white/30")}>{fmtTime(s)}</button>
                  ))}
                </div>
              ) : <p className="text-sm text-steel-500">Sem horários livres nesta data.</p>}
            </>
          )}
          <Field label="Observação (histórico)" htmlFor="rs-note"><Input id="rs-note" value={note} onChange={(e) => setNote(e.target.value)} /></Field>
        </div>
      </Dialog>
    </>
  );
}

function PaymentCard({ appt, target }: { appt: AppointmentDetail; target: number | null }) {
  const [priceOpen, setPriceOpen] = useState(false);
  const [payOpen, setPayOpen] = useState<"payment" | "refund" | null>(null);
  const [price, setPrice] = useState(appt.final_total === null ? "" : String(appt.final_total).replace(".", ","));
  const [priceNote, setPriceNote] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<MoneyMethod>(appt.payment_method);
  const [paidAt, setPaidAt] = useState(todayLocal());
  const [payNote, setPayNote] = useState("");
  const invalidate = useInvalidate();
  const remaining = target === null ? null : Math.max(0, target - Number(appt.amount_paid));

  const priceM = useMutation({
    mutationFn: () => ownerOps.setFinalPrice(appt.id, price.trim() ? parseMoney(price) : null, priceNote),
    onSuccess: () => { toast.success("Valor final salvo."); setPriceOpen(false); void invalidate(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const payM = useMutation({
    mutationFn: () => {
      const v = parseMoney(amount);
      if (!v) throw new Error("invalid_amount");
      const when = localToIso(paidAt, "12:00");
      return payOpen === "refund" ? ownerOps.registerRefund(appt.id, v, method, when, payNote) : ownerOps.registerPayment(appt.id, v, method, when, payNote);
    },
    onSuccess: () => { toast.success(payOpen === "refund" ? "Estorno registrado." : "Pagamento registrado."); setPayOpen(null); setAmount(""); setPayNote(""); void invalidate(); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Card title="Valores e pagamento">
      <dl className="space-y-2.5 text-sm">
        <Row k="Preço de referência" v={appt.reference_total === null ? "Sob avaliação" : fmtMoney(appt.reference_total)} />
        <Row k="Valor final" v={<span className="inline-flex items-center gap-2 font-semibold">{appt.final_total === null ? "Não definido" : fmtMoney(appt.final_total)}<button type="button" aria-label="Editar valor final" onClick={() => setPriceOpen(true)} className="text-steel-400 hover:text-pearl"><Pencil className="size-3.5" /></button></span>} />
        <Row k="Forma escolhida" v={BOOKING_METHOD_LABEL[appt.payment_method]} />
        <Row k="Recebido" v={<span className="font-semibold">{fmtMoney(appt.amount_paid)}</span>} />
        <Row k="Situação" v={PAYMENT_STATUS_LABEL[appt.payment_status]} />
        {remaining !== null && remaining > 0 && appt.status !== "cancelled" && appt.status !== "rejected" ? <Row k="Falta receber" v={<span className="font-semibold text-warn">{fmtMoney(remaining)}</span>} /> : null}
      </dl>
      <div className="mt-4 flex flex-wrap gap-2">
        {appt.status !== "rejected" ? (
          <Button size="sm" onClick={() => { setMethod(appt.payment_method); setAmount(remaining ? String(remaining.toFixed(2)).replace(".", ",") : ""); setPayOpen("payment"); }}>
            <Plus className="size-4" aria-hidden /> Registrar pagamento
          </Button>
        ) : null}
        {Number(appt.amount_paid) > 0 ? (
          <Button size="sm" variant="ghost" onClick={() => { setAmount(""); setPayOpen("refund"); }}>
            <Undo2 className="size-4" aria-hidden /> Estorno
          </Button>
        ) : null}
      </div>
      {appt.transactions.length ? (
        <ul className="mt-4 space-y-1.5 border-t border-white/5 pt-3 text-xs">
          {appt.transactions.map((t) => (
            <li key={t.id} className="flex justify-between gap-3">
              <span className="text-steel-400">{t.paid_at ? fmtDateTime(t.paid_at).slice(0, 10) : "—"} · {t.payment_method ? MONEY_METHOD_LABEL[t.payment_method] : ""} {t.type === "refund" ? "(estorno)" : ""}</span>
              <span className={cn("font-semibold tabular-nums", t.type === "refund" && "text-danger")}>{t.type === "refund" ? "−" : ""}{fmtMoney(t.amount)}</span>
            </li>
          ))}
        </ul>
      ) : null}
      <p className="mt-3 text-xs text-steel-500">Receita só entra no financeiro quando o pagamento é registrado aqui.</p>

      <Dialog open={priceOpen} onClose={() => setPriceOpen(false)} size="sm" title="Valor final" description="Vale só para este agendamento. O preço do catálogo não muda."
        footer={<><Button variant="ghost" onClick={() => setPriceOpen(false)}>Cancelar</Button><Button loading={priceM.isPending} onClick={() => priceM.mutate()}>Salvar</Button></>}>
        <div className="space-y-4">
          <Field label="Valor (R$) — deixe vazio para remover" htmlFor="fp"><Input id="fp" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" /></Field>
          <Field label="Motivo (histórico)" htmlFor="fpn"><Textarea id="fpn" value={priceNote} onChange={(e) => setPriceNote(e.target.value)} placeholder="Ex.: interior muito sujo" /></Field>
        </div>
      </Dialog>

      <Dialog open={!!payOpen} onClose={() => setPayOpen(null)} size="sm" title={payOpen === "refund" ? "Registrar estorno" : "Registrar pagamento recebido"}
        description={payOpen === "refund" ? "O pagamento original continua no histórico." : "Use para pagamentos parciais ou totais efetivamente recebidos."}
        footer={<><Button variant="ghost" onClick={() => setPayOpen(null)}>Cancelar</Button><Button loading={payM.isPending} onClick={() => payM.mutate()}>Registrar</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Valor (R$)" htmlFor="pv"><Input id="pv" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
          <Field label="Forma" htmlFor="pm"><Select id="pm" value={method} onChange={(e) => setMethod(e.target.value as MoneyMethod)}>{(Object.keys(MONEY_METHOD_LABEL) as MoneyMethod[]).map((k) => <option key={k} value={k}>{MONEY_METHOD_LABEL[k]}</option>)}</Select></Field>
          <Field label="Data" htmlFor="pd"><Input id="pd" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} /></Field>
          <Field label="Observação" htmlFor="pn"><Input id="pn" value={payNote} onChange={(e) => setPayNote(e.target.value)} /></Field>
        </div>
      </Dialog>
    </Card>
  );
}

function NotesCard({ appt }: { appt: AppointmentDetail }) {
  const [value, setValue] = useState(appt.internal_notes);
  const invalidate = useInvalidate();
  const m = useMutation({
    mutationFn: () => ownerOps.updateNotes(appt.id, value),
    onSuccess: () => { toast.success("Observações salvas."); void invalidate(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Card title="Observações internas">
      <Textarea aria-label="Observações internas" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Visíveis só para você." />
      <div className="mt-3 flex justify-end">
        <Button size="sm" variant="secondary" disabled={value === appt.internal_notes} loading={m.isPending} onClick={() => m.mutate()}>Salvar observações</Button>
      </div>
    </Card>
  );
}
