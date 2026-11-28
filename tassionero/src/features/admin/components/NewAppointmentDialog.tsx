import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Notice, Spinner } from "@/components/ui/feedback";
import { Field, Input, Select, Toggle } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import { fmtDuration, fmtTime, localToIso, todayLocal } from "@/lib/datetime";
import { parseMoney } from "@/lib/money";
import { fmtPhone, maskPhone } from "@/lib/phone";
import { cn } from "@/lib/cn";
import { adminCategoriesQuery, adminKeys, adminServicesQuery, customerQuery, customersQuery, ownerOps } from "../api";

/**
 * Agendamento criado pelo proprietário (ex.: combinado pelo WhatsApp).
 * Modo "horário livre" usa os slots do banco; modo "manual" define início e término
 * (serviços longos, vários dias) — o banco ainda impede sobreposição.
 */
export function NewAppointmentDialog({ open, onClose, initialDate, initialHour }: { open: boolean; onClose: () => void; initialDate?: string; initialHour?: number }) {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const services = useQuery({ ...adminServicesQuery, enabled: open });
  const categories = useQuery({ ...adminCategoriesQuery, enabled: open });

  const [search, setSearch] = useState("");
  const [customerId, setCustomerId] = useState<string>("");
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "" });
  const [vehicleId, setVehicleId] = useState<string>("");
  const [newVehicle, setNewVehicle] = useState({ vehicle_category_id: "", make: "", model: "" });
  const [serviceIds, setServiceIds] = useState<string[]>([]);
  const [date, setDate] = useState(initialDate ?? todayLocal());
  const [slot, setSlot] = useState<string>("");
  const [manual, setManual] = useState(false);
  const [manualStart, setManualStart] = useState(`${initialDate ?? todayLocal()}T${String(initialHour ?? 8).padStart(2, "0")}:00`);
  const [manualEnd, setManualEnd] = useState(`${initialDate ?? todayLocal()}T${String((initialHour ?? 8) + 1).padStart(2, "0")}:00`);
  const [method, setMethod] = useState<"pix" | "cash">("cash");
  const [status, setStatus] = useState<"confirmed" | "pending">("confirmed");
  const [price, setPrice] = useState("");
  const [notes, setNotes] = useState("");

  const customers = useQuery({ ...customersQuery(search), enabled: open && search.trim().length >= 2 });
  const customer = useQuery({ ...customerQuery(customerId), enabled: open && !!customerId });
  const selectedServices = (services.data ?? []).filter((s) => serviceIds.includes(s.id));
  const duration = selectedServices.reduce((a, s) => a + s.duration_minutes, 0);
  // Serviços longos (agendados pelo WhatsApp) sempre usam início/término manuais.
  const hasLong = selectedServices.some((s) => s.booking_mode === "whatsapp");
  const isManual = manual || hasLong;

  const slots = useQuery({
    queryKey: ["admin", "slots", date, duration],
    enabled: open && !isManual && duration > 0 && !!date,
    queryFn: () => ownerOps.availableSlots(date, duration),
  });

  const categoryOk = customerId && vehicleId ? true : !!newVehicle.vehicle_category_id && newVehicle.model.trim().length >= 2;
  const customerOk = customerId ? true : newCustomer.name.trim().length >= 2 && newCustomer.phone.replace(/\D/g, "").length >= 10;
  const timeOk = isManual ? manualStart && manualEnd && manualEnd > manualStart : !!slot;
  const canSave = customerOk && categoryOk && serviceIds.length > 0 && timeOk;

  const create = useMutation({
    mutationFn: () => {
      const payload: Record<string, unknown> = {
        service_ids: serviceIds,
        payment_method: method,
        status,
        internal_notes: notes,
        final_total: price ? parseMoney(price) : null,
      };
      if (customerId) payload.customer_id = customerId;
      else payload.customer = newCustomer;
      if (customerId && vehicleId) payload.vehicle_id = vehicleId;
      else payload.vehicle = newVehicle;
      if (isManual) {
        payload.starts_at = localToIso(manualStart.slice(0, 10), manualStart.slice(11, 16));
        payload.ends_at = localToIso(manualEnd.slice(0, 10), manualEnd.slice(11, 16));
      } else payload.starts_at = slot;
      return ownerOps.createAppointment(payload);
    },
    onSuccess: (appt) => {
      toast.success("Agendamento criado.");
      void qc.invalidateQueries({ queryKey: adminKeys.all });
      onClose();
      const id = (appt as { id?: string } | null)?.id;
      if (id) void navigate({ to: "/admin/agendamentos/$id", params: { id } });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const vehicles = customer.data?.customer.vehicles ?? [];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title="Novo agendamento"
      description="Para pedidos combinados pelo WhatsApp ou presencialmente."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button disabled={!canSave} loading={create.isPending} onClick={() => create.mutate()}>Criar agendamento</Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Cliente */}
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-bold">Cliente</legend>
          {customerId ? (
            <div className="flex items-center justify-between rounded-control bg-graphite-900 px-4 py-3 ring-1 ring-white/10">
              <span>
                <span className="font-semibold">{customer.data?.customer.name ?? "…"}</span>{" "}
                <span className="text-sm text-steel-400">{fmtPhone(customer.data?.customer.phone)}</span>
              </span>
              <Button size="sm" variant="ghost" onClick={() => { setCustomerId(""); setVehicleId(""); }}>Trocar</Button>
            </div>
          ) : (
            <>
              <Field label="Buscar cliente existente (nome ou telefone)" htmlFor="na-search">
                <Input id="na-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Digite ao menos 2 letras" />
              </Field>
              {customers.data?.length ? (
                <ul className="max-h-36 overflow-y-auto rounded-control ring-1 ring-white/10">
                  {customers.data.slice(0, 8).map((c) => (
                    <li key={c.id}>
                      <button type="button" onClick={() => setCustomerId(c.id)} className="flex w-full justify-between px-4 py-2 text-left text-sm hover:bg-white/5">
                        <span>{c.name}</span>
                        <span className="text-steel-400">{fmtPhone(c.phone)}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              <p className="text-xs text-steel-500">Ou cadastre um novo:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nome" htmlFor="na-name">
                  <Input id="na-name" value={newCustomer.name} onChange={(e) => setNewCustomer((c) => ({ ...c, name: e.target.value }))} />
                </Field>
                <Field label="WhatsApp" htmlFor="na-phone">
                  <Input id="na-phone" inputMode="tel" value={newCustomer.phone} onChange={(e) => setNewCustomer((c) => ({ ...c, phone: maskPhone(e.target.value) }))} placeholder="(49) 99999-9999" />
                </Field>
              </div>
            </>
          )}
        </fieldset>

        {/* Veículo */}
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-bold">Veículo</legend>
          {customerId && vehicles.length ? (
            <Select aria-label="Veículo do cliente" value={vehicleId} onChange={(e) => setVehicleId(e.target.value)}>
              <option value="">Novo veículo…</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.vehicle_categories?.name} · {[v.make, v.model].filter(Boolean).join(" ")}</option>
              ))}
            </Select>
          ) : null}
          {!vehicleId ? (
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Categoria" htmlFor="na-cat">
                <Select id="na-cat" value={newVehicle.vehicle_category_id} onChange={(e) => setNewVehicle((v) => ({ ...v, vehicle_category_id: e.target.value }))}>
                  <option value="">Escolha…</option>
                  {(categories.data ?? []).filter((c) => c.is_active).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </Select>
              </Field>
              <Field label="Marca" htmlFor="na-make">
                <Input id="na-make" value={newVehicle.make} onChange={(e) => setNewVehicle((v) => ({ ...v, make: e.target.value }))} />
              </Field>
              <Field label="Modelo" htmlFor="na-model">
                <Input id="na-model" value={newVehicle.model} onChange={(e) => setNewVehicle((v) => ({ ...v, model: e.target.value }))} />
              </Field>
            </div>
          ) : null}
        </fieldset>

        {/* Serviços */}
        <fieldset>
          <legend className="mb-2 text-sm font-bold">Serviços {duration ? <span className="font-normal text-steel-400">· {fmtDuration(duration)}</span> : null}</legend>
          {services.isPending ? <Spinner /> : (
            <div className="flex flex-wrap gap-2">
              {(services.data ?? []).filter((s) => s.is_active).map((s) => {
                const on = serviceIds.includes(s.id);
                return (
                  <button key={s.id} type="button" aria-pressed={on} onClick={() => { setServiceIds((ids) => (on ? ids.filter((x) => x !== s.id) : [...ids, s.id])); setSlot(""); }}
                    className={cn("rounded-full px-3 py-1.5 text-sm ring-1 transition", on ? "bg-racing-500/15 text-pearl ring-racing-500" : "text-steel-300 ring-white/15 hover:ring-white/30")}>
                    {s.name}
                  </button>
                );
              })}
            </div>
          )}
        </fieldset>

        {/* Horário */}
        <fieldset className="space-y-3">
          <legend className="mb-2 text-sm font-bold">Horário</legend>
          <Toggle id="na-manual" checked={isManual} disabled={hasLong} onChange={setManual} label="Definir início e término manualmente (serviços longos ou fora do expediente)" />
          {isManual ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Início" htmlFor="na-ms"><Input id="na-ms" type="datetime-local" value={manualStart} onChange={(e) => setManualStart(e.target.value)} /></Field>
              <Field label="Término" htmlFor="na-me"><Input id="na-me" type="datetime-local" value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} /></Field>
              <Notice className="sm:col-span-2">O banco ainda impede sobreposição com outros agendamentos e bloqueios.</Notice>
            </div>
          ) : (
            <>
              <Field label="Data" htmlFor="na-date" className="max-w-xs"><Input id="na-date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setSlot(""); }} /></Field>
              {!duration ? <p className="text-sm text-steel-500">Escolha os serviços para ver os horários livres.</p> : slots.isPending ? <Spinner label="Buscando horários" /> : slots.data?.length ? (
                <div className="flex flex-wrap gap-2">
                  {slots.data.map((s) => (
                    <button key={s} type="button" aria-pressed={slot === s} onClick={() => setSlot(s)} className={cn("h-9 rounded-control px-3 text-sm font-semibold ring-1", slot === s ? "bg-racing-500 text-white ring-racing-500" : "ring-white/15 hover:ring-white/30")}>
                      {fmtTime(s)}
                    </button>
                  ))}
                </div>
              ) : <p className="text-sm text-steel-500">Sem horários livres nesta data para {fmtDuration(duration)}.</p>}
            </>
          )}
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Pagamento" htmlFor="na-pay"><Select id="na-pay" value={method} onChange={(e) => setMethod(e.target.value as "pix" | "cash")}><option value="cash">Dinheiro</option><option value="pix">Pix</option></Select></Field>
          <Field label="Status" htmlFor="na-st"><Select id="na-st" value={status} onChange={(e) => setStatus(e.target.value as "confirmed" | "pending")}><option value="confirmed">Confirmado</option><option value="pending">Pendente</option></Select></Field>
          <Field label="Valor final (opcional)" htmlFor="na-price"><Input id="na-price" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0,00" /></Field>
        </div>
        <Field label="Observações internas" htmlFor="na-notes"><Input id="na-notes" value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      </div>
    </Dialog>
  );
}
