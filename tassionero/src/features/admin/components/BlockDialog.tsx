import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Notice } from "@/components/ui/feedback";
import { Field, Input, Toggle } from "@/components/ui/fields";
import { StatusChip } from "@/components/ui/StatusChip";
import { errorMessage } from "@/domain/errors";
import type { AppointmentStatus } from "@/domain/types";
import { addDaysLocal, fmtDateTime, localToIso, todayLocal } from "@/lib/datetime";
import { adminKeys, ownerOps } from "../api";

type Conflict = { id: string; public_code: string; starts_at: string; ends_at: string; status: AppointmentStatus; customer_name: string; vehicle: string };
type Resolution = { action: "cancel" | "reschedule" | ""; newStart: string };

/**
 * Bloqueio de período. Se houver reservas ativas no intervalo, cada uma precisa
 * ser cancelada ou reagendada; sem resolver todas, o banco não cria o bloqueio.
 */
export function BlockDialog({ open, onClose, initialDate }: { open: boolean; onClose: () => void; initialDate?: string }) {
  const qc = useQueryClient();
  const base = initialDate ?? todayLocal();
  const [wholeDay, setWholeDay] = useState(true);
  const [startDate, setStartDate] = useState(base);
  const [endDate, setEndDate] = useState(base);
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [reason, setReason] = useState("");
  const [conflicts, setConflicts] = useState<Conflict[] | null>(null);
  const [res, setRes] = useState<Record<string, Resolution>>({});

  const range = () =>
    wholeDay
      ? { start: localToIso(startDate, "00:00"), end: localToIso(addDaysLocal(endDate, 1), "00:00") }
      : { start: localToIso(startDate, startTime), end: localToIso(endDate, endTime) };

  const check = useMutation({
    mutationFn: async () => {
      const r = range();
      if (r.end <= r.start) throw new Error("invalid_range");
      return (await ownerOps.blockConflicts(r.start, r.end)) as Conflict[];
    },
    onSuccess: (list) => {
      setConflicts(list);
      setRes(Object.fromEntries(list.map((c) => [c.id, { action: "", newStart: "" }])));
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const save = useMutation({
    mutationFn: () => {
      const r = range();
      const resolutions = (conflicts ?? []).map((c) => {
        const x = res[c.id];
        return x?.action === "reschedule"
          ? { appointment_id: c.id, action: "reschedule" as const, new_start: localToIso(x.newStart.slice(0, 10), x.newStart.slice(11, 16)) }
          : { appointment_id: c.id, action: "cancel" as const };
      });
      return ownerOps.createBlock(r.start, r.end, reason, resolutions);
    },
    onSuccess: () => {
      toast.success("Período bloqueado.");
      void qc.invalidateQueries({ queryKey: adminKeys.all });
      setConflicts(null);
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const allResolved = (conflicts ?? []).every((c) => {
    const r = res[c.id];
    return r?.action === "cancel" || (r?.action === "reschedule" && r.newStart.length >= 16);
  });

  return (
    <Dialog
      open={open}
      onClose={() => {
        setConflicts(null);
        onClose();
      }}
      title="Bloquear período"
      description="Horários bloqueados não aparecem para agendamento no site."
      footer={
        conflicts === null ? (
          <>
            <Button variant="ghost" onClick={onClose}>Cancelar</Button>
            <Button loading={check.isPending} onClick={() => check.mutate()}>Verificar agenda</Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setConflicts(null)}>Voltar</Button>
            <Button disabled={!allResolved} loading={save.isPending} onClick={() => save.mutate()}>
              {conflicts.length ? "Resolver e bloquear" : "Bloquear período"}
            </Button>
          </>
        )
      }
    >
      {conflicts === null ? (
        <div className="space-y-4">
          <Toggle id="bl-day" checked={wholeDay} onChange={setWholeDay} label="Dia(s) inteiro(s)" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="De" htmlFor="bl-sd"><Input id="bl-sd" type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value); }} /></Field>
            <Field label="Até" htmlFor="bl-ed"><Input id="bl-ed" type="date" value={endDate} min={startDate} onChange={(e) => setEndDate(e.target.value)} /></Field>
            {!wholeDay ? (
              <>
                <Field label="Hora inicial" htmlFor="bl-st"><Input id="bl-st" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} /></Field>
                <Field label="Hora final" htmlFor="bl-et"><Input id="bl-et" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} /></Field>
              </>
            ) : null}
          </div>
          <Field label="Motivo (opcional)" htmlFor="bl-r"><Input id="bl-r" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex.: feriado, manutenção" /></Field>
        </div>
      ) : conflicts.length === 0 ? (
        <Notice tone="ok">Nenhum agendamento ativo no período. Pode bloquear.</Notice>
      ) : (
        <div className="space-y-4">
          <Notice tone="warn">
            {conflicts.length} agendamento(s) ativo(s) no período. Escolha o que fazer com cada um. Avise os clientes pelo WhatsApp.
          </Notice>
          <ul className="space-y-3">
            {conflicts.map((c) => (
              <li key={c.id} className="rounded-control bg-graphite-900 p-4 ring-1 ring-white/10">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{c.customer_name} <span className="font-normal text-steel-400">· {c.vehicle}</span></p>
                  <StatusChip status={c.status} />
                </div>
                <p className="mt-0.5 text-sm text-steel-400">{fmtDateTime(c.starts_at)} · {c.public_code}</p>
                <div className="mt-3 flex flex-wrap items-end gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name={`r-${c.id}`} checked={res[c.id]?.action === "cancel"} onChange={() => setRes((r) => ({ ...r, [c.id]: { action: "cancel", newStart: "" } }))} className="accent-racing-500" /> Cancelar
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm">
                    <input type="radio" name={`r-${c.id}`} checked={res[c.id]?.action === "reschedule"} onChange={() => setRes((r) => ({ ...r, [c.id]: { action: "reschedule", newStart: r[c.id]?.newStart ?? "" } }))} className="accent-racing-500" /> Reagendar para
                  </label>
                  {res[c.id]?.action === "reschedule" ? (
                    <Input type="datetime-local" aria-label="Novo horário" className="w-auto" value={res[c.id]?.newStart ?? ""} onChange={(e) => setRes((r) => ({ ...r, [c.id]: { action: "reschedule", newStart: e.target.value } }))} />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Dialog>
  );
}
