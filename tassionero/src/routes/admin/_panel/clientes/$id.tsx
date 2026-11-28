import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, MessageCircle, Plus } from "lucide-react";
import { Button, ExternalButton } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { StatusChip } from "@/components/ui/StatusChip";
import { errorMessage } from "@/domain/errors";
import { waLink } from "@/domain/whatsapp";
import { fmtDate, fmtDateTime } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";
import { fmtPhone, maskPhone } from "@/lib/phone";
import { AdminPage, Card, Kpi } from "@/features/admin/components/AdminPage";
import { adminKeys, customerOps, customerQuery } from "@/features/admin/api";
import { VehicleDialog } from "@/features/admin/components/VehicleDialog";
import type { Vehicle } from "@/domain/types";

export const Route = createFileRoute("/admin/_panel/clientes/$id")({ component: CustomerPage });

function CustomerPage() {
  const { id } = Route.useParams();
  const q = useQuery(customerQuery(id));
  const qc = useQueryClient();
  const [edit, setEdit] = useState(false);
  const [vehicle, setVehicle] = useState<Partial<Vehicle> | null>(null);

  if (q.isPending) return <Skeleton className="h-[60vh] rounded-panel" />;
  if (q.isError) return <ErrorState error={q.error} onRetry={() => q.refetch()} />;
  const { customer: c, paid } = q.data;
  const wa = waLink(c.phone, `Olá, ${c.name.split(" ")[0]}! Aqui é da Tassionero.`);
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.all });

  return (
    <AdminPage
      title={c.name}
      subtitle={`${fmtPhone(c.phone)} · cliente desde ${fmtDate(c.created_at)}`}
      actions={
        <>
          <Link to="/admin/clientes" className="inline-flex items-center gap-1.5 text-sm font-semibold text-steel-400 hover:text-pearl"><ArrowLeft className="size-4" aria-hidden /> Clientes</Link>
          {wa ? <ExternalButton href={wa} size="sm" variant="secondary"><MessageCircle className="size-4" aria-hidden /> WhatsApp</ExternalButton> : null}
          <Button size="sm" variant="secondary" onClick={() => setEdit(true)}>Editar</Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Kpi label="Agendamentos" value={c.appointments.length} />
        <Kpi label="Concluídos" value={c.appointments.filter((a) => a.status === "completed").length} />
        <Kpi label="Total pago registrado" value={fmtMoney(paid)} tone="good" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_1.4fr]">
        <div className="space-y-5">
          <Card title="Veículos" actions={<Button size="sm" variant="ghost" onClick={() => setVehicle({ customer_id: c.id })}><Plus className="size-4" aria-hidden /> Adicionar</Button>}>
            {c.vehicles.length === 0 ? <p className="text-sm text-steel-500">Nenhum veículo.</p> : (
              <ul className="divide-y divide-white/5 text-sm">
                {c.vehicles.map((v) => (
                  <li key={v.id} className="flex items-center justify-between gap-3 py-2.5">
                    <span><span className="font-semibold">{[v.make, v.model].filter(Boolean).join(" ")}</span> <span className="text-steel-400">· {v.vehicle_categories?.name}{v.year ? ` · ${v.year}` : ""}{v.color ? ` · ${v.color}` : ""}</span></span>
                    <Button size="sm" variant="ghost" onClick={() => setVehicle(v)}>Editar</Button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Observações">
            <p className="text-sm whitespace-pre-line text-steel-300">{c.notes || "Sem observações."}</p>
          </Card>
        </div>
        <Card title="Histórico de agendamentos">
          {c.appointments.length === 0 ? <EmptyState title="Sem agendamentos" /> : (
            <ul className="divide-y divide-white/5">
              {c.appointments.map((a) => (
                <li key={a.id}>
                  <Link to="/admin/agendamentos/$id" params={{ id: a.id }} className="flex items-center justify-between gap-3 py-3 hover:opacity-90">
                    <span>
                      <span className="block text-sm font-semibold">{fmtDateTime(a.starts_at)}</span>
                      <span className="block text-xs text-steel-400">{a.appointment_items.map((i) => i.service_name_snapshot).join(", ")} · {a.vehicle_snapshot}</span>
                    </span>
                    <span className="flex items-center gap-3">
                      <span className="text-sm font-semibold tabular-nums">{fmtMoney(a.final_total ?? a.reference_total)}</span>
                      <StatusChip status={a.status} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
      <EditCustomer open={edit} onClose={() => setEdit(false)} initial={{ name: c.name, phone: fmtPhone(c.phone), notes: c.notes }} onSave={async (v) => { await customerOps.update(c.id, v); await invalidate(); }} />
      <VehicleDialog value={vehicle} onClose={() => setVehicle(null)} onSaved={() => void invalidate()} />
    </AdminPage>
  );
}

function EditCustomer({ open, onClose, initial, onSave }: { open: boolean; onClose: () => void; initial: { name: string; phone: string; notes: string }; onSave: (v: { name: string; phone: string; notes: string }) => Promise<void> }) {
  const [v, setV] = useState(initial);
  const m = useMutation({
    mutationFn: () => {
      const digits = v.phone.replace(/\D/g, "");
      if (digits.length < 10) throw new Error("invalid_phone");
      return onSave({ name: v.name.trim(), notes: v.notes, phone: `+55${digits.replace(/^55/, "")}` });
    },
    onSuccess: () => { toast.success("Cliente atualizado."); onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open={open} onClose={onClose} title="Editar cliente" size="sm" footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={m.isPending} onClick={() => m.mutate()}>Salvar</Button></>}>
      <div className="space-y-4">
        <Field label="Nome" htmlFor="ec-n"><Input id="ec-n" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} /></Field>
        <Field label="WhatsApp" htmlFor="ec-p"><Input id="ec-p" value={v.phone} onChange={(e) => setV({ ...v, phone: maskPhone(e.target.value) })} /></Field>
        <Field label="Observações" htmlFor="ec-o"><Textarea id="ec-o" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
      </div>
    </Dialog>
  );
}
