import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Ban, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { STATUS_LABEL, STATUS_TONE } from "@/domain/status";
import { errorMessage } from "@/domain/errors";
import type { AppointmentStatus } from "@/domain/types";
import { addDaysLocal, capFirst, fmtDate, fmtDateTime, fmtTime, localDateOf, todayLocal, WEEKDAYS_SHORT, weekdayOf } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { AdminPage, Card, Segmented } from "@/features/admin/components/AdminPage";
import { BlockDialog } from "@/features/admin/components/BlockDialog";
import { NewAppointmentDialog } from "@/features/admin/components/NewAppointmentDialog";
import { WeekGrid } from "@/features/admin/components/WeekGrid";
import { adminKeys, ownerOps, rangeQuery } from "@/features/admin/api";
import { dayStartIso, weekStart } from "@/features/admin/period";

type View = "day" | "week" | "month";

export const Route = createFileRoute("/admin/_panel/agenda")({
  validateSearch: z.object({
    view: z.enum(["day", "week", "month"]).optional(),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    novo: z.boolean().optional(),
  }),
  component: AgendaPage,
});

const MONTHS = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];

function monthStart(date: string) {
  return `${date.slice(0, 7)}-01`;
}
function addMonths(date: string, n: number) {
  const [y, m] = date.split("-").map(Number) as [number, number];
  const d = new Date(Date.UTC(y, m - 1 + n, 1));
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-01`;
}

function AgendaPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const view: View = search.view ?? "week";
  const date = search.data ?? todayLocal();
  const [newOpen, setNewOpen] = useState(!!search.novo);
  const [newAt, setNewAt] = useState<{ date?: string; hour?: number }>({});
  const [blockOpen, setBlockOpen] = useState(false);
  const qc = useQueryClient();

  const span =
    view === "day"
      ? { from: date, to: addDaysLocal(date, 1) }
      : view === "week"
        ? { from: weekStart(date), to: addDaysLocal(weekStart(date), 7) }
        : { from: weekStart(monthStart(date)), to: addDaysLocal(weekStart(addMonths(date, 1)), 7) };
  const range = useQuery(rangeQuery(dayStartIso(span.from), dayStartIso(span.to)));

  const shift = (dir: 1 | -1) => {
    const next = view === "day" ? addDaysLocal(date, dir) : view === "week" ? addDaysLocal(date, 7 * dir) : addMonths(date, dir);
    void navigate({ search: (s) => ({ ...s, data: next }) });
  };

  const removeBlock = useMutation({
    mutationFn: (id: string) => ownerOps.deleteBlock(id),
    onSuccess: () => {
      toast.success("Bloqueio removido.");
      void qc.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const visible = (range.data?.appointments ?? []).filter((a) => a.status !== "rejected" && a.status !== "cancelled");
  const title =
    view === "day"
      ? fmtDate(`${date}T12:00:00-03:00`, "EEEE, d 'de' MMMM")
      : view === "week"
        ? `${fmtDate(`${span.from}T12:00:00-03:00`, "d MMM")} – ${fmtDate(`${addDaysLocal(span.from, 6)}T12:00:00-03:00`, "d MMM yyyy")}`
        : `${MONTHS[Number(date.slice(5, 7)) - 1]} ${date.slice(0, 4)}`;

  return (
    <AdminPage
      title="Agenda"
      subtitle="Uma agenda, um recurso. Pendentes também ocupam o horário."
      actions={
        <>
          <Button variant="secondary" size="sm" onClick={() => setBlockOpen(true)}>
            <Ban className="size-4" aria-hidden /> Bloquear período
          </Button>
          <Button size="sm" onClick={() => { setNewAt({}); setNewOpen(true); }}>
            <Plus className="size-4" aria-hidden /> Novo agendamento
          </Button>
        </>
      }
    >
      <Card bodyClass="p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => shift(-1)} aria-label="Anterior" className="grid size-9 place-items-center rounded-full ring-1 ring-white/10 hover:bg-white/5"><ChevronLeft className="size-4" /></button>
            <button type="button" onClick={() => shift(1)} aria-label="Próximo" className="grid size-9 place-items-center rounded-full ring-1 ring-white/10 hover:bg-white/5"><ChevronRight className="size-4" /></button>
            <Button variant="ghost" size="sm" onClick={() => void navigate({ search: (s) => ({ ...s, data: undefined }) })}>Hoje</Button>
            <h2 className="ml-1 font-bold">{capFirst(title)}</h2>
          </div>
          <Segmented<View>
            label="Visualização"
            value={view}
            onChange={(v) => void navigate({ search: (s) => ({ ...s, view: v }) })}
            options={[{ value: "day", label: "Dia" }, { value: "week", label: "Semana" }, { value: "month", label: "Mês" }]}
          />
        </div>

        <ul className="mb-4 flex flex-wrap gap-3 text-xs text-steel-400" aria-label="Legenda de status">
          {(["pending", "confirmed", "in_progress", "completed"] as AppointmentStatus[]).map((s) => (
            <li key={s} className="inline-flex items-center gap-1.5"><span className={cn("size-2.5 rounded-sm", STATUS_TONE[s].dot)} /> {STATUS_LABEL[s]}</li>
          ))}
          <li className="inline-flex items-center gap-1.5"><span className="size-2.5 rounded-sm bg-[repeating-linear-gradient(135deg,#6b7280_0,#6b7280_2px,transparent_2px,transparent_4px)] ring-1 ring-white/20" /> Bloqueado</li>
        </ul>

        {range.isError ? (
          <ErrorState error={range.error} onRetry={() => range.refetch()} />
        ) : range.isPending ? (
          <Skeleton className="h-[600px]" />
        ) : view === "month" ? (
          <MonthGrid month={date} start={span.from} appointments={visible} onPick={(d) => void navigate({ search: (s) => ({ ...s, view: "day", data: d }) })} />
        ) : (
          <WeekGrid
            weekStartDate={view === "day" ? date : span.from}
            days={view === "day" ? 1 : 7}
            appointments={visible}
            blocks={range.data.blocks}
            onEmptyClick={(d, h) => { setNewAt({ date: d, hour: h }); setNewOpen(true); }}
          />
        )}
      </Card>

      {range.data?.blocks.length ? (
        <Card title="Bloqueios no período">
          <ul className="divide-y divide-white/5">
            {range.data.blocks.map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span>
                  <span className="font-semibold">{b.reason || "Bloqueio"}</span>
                  <span className="ml-2 text-steel-400">{fmtDateTime(b.starts_at)} → {fmtDateTime(b.ends_at)}</span>
                </span>
                <Button variant="ghost" size="sm" aria-label="Remover bloqueio" loading={removeBlock.isPending && removeBlock.variables === b.id} onClick={() => removeBlock.mutate(b.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {newOpen ? <NewAppointmentDialog open onClose={() => { setNewOpen(false); if (search.novo) void navigate({ search: (s) => ({ ...s, novo: undefined }) }); }} initialDate={newAt.date} initialHour={newAt.hour} /> : null}
      {blockOpen ? <BlockDialog open onClose={() => setBlockOpen(false)} initialDate={date} /> : null}
    </AdminPage>
  );
}

function MonthGrid({ month, start, appointments, onPick }: { month: string; start: string; appointments: { id: string; starts_at: string; status: AppointmentStatus; customer_name_snapshot: string }[]; onPick: (d: string) => void }) {
  const days = Array.from({ length: 42 }, (_, i) => addDaysLocal(start, i));
  const today = todayLocal();
  return (
    <div className="overflow-x-auto">
      <div className="grid min-w-[640px] grid-cols-7 gap-px overflow-hidden rounded-control bg-white/[0.06]">
        {[1, 2, 3, 4, 5, 6, 0].map((w) => (
          <div key={w} className="bg-graphite-900 py-2 text-center text-xs text-steel-500">{WEEKDAYS_SHORT[w]}</div>
        ))}
        {days.map((d) => {
          const items = appointments.filter((a) => localDateOf(a.starts_at) === d);
          const inMonth = d.slice(0, 7) === month.slice(0, 7);
          return (
            <button key={d} type="button" onClick={() => onPick(d)} className={cn("min-h-24 bg-graphite-900 p-1.5 text-left align-top transition hover:bg-graphite-800", !inMonth && "opacity-40", weekdayOf(d) === 0 && "bg-carbon-2")}>
              <span className={cn("mb-1 inline-grid size-6 place-items-center rounded-full text-xs font-bold", d === today && "bg-racing-500 text-white")}>{Number(d.slice(8))}</span>
              <span className="block space-y-0.5">
                {items.slice(0, 3).map((a) => (
                  <span key={a.id} className="flex items-center gap-1 truncate text-[11px]">
                    <span className={cn("size-1.5 shrink-0 rounded-full", STATUS_TONE[a.status].dot)} />
                    {fmtTime(a.starts_at)} {a.customer_name_snapshot.split(" ")[0]}
                  </span>
                ))}
                {items.length > 3 ? <span className="block text-[11px] text-steel-500">+{items.length - 3} mais</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-steel-500">Clique em um dia para ver os horários. <Link to="/admin/agendamentos" className="underline">Ver em lista</Link></p>
    </div>
  );
}
