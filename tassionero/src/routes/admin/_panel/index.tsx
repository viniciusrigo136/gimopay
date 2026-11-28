import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { AlertTriangle, ArrowRight, CalendarClock, CalendarDays, CheckCheck, Hourglass, MessageCircle, Plus } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { StatusChip } from "@/components/ui/StatusChip";
import { waLink } from "@/domain/whatsapp";
import { addDaysLocal, capFirst, fmtDate, fmtDateLong, fmtDuration, fmtSince, fmtTime, todayLocal } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";
import { AdminPage, Card, Kpi, Segmented } from "@/features/admin/components/AdminPage";
import { ColumnSeries, HBarList, IncomeExpenseChart } from "@/features/admin/components/charts";
import { StatusActions } from "@/features/admin/components/StatusActions";
import { WeekGrid } from "@/features/admin/components/WeekGrid";
import { dashboardQuery, pendingQuery, rangeQuery, settingsQuery } from "@/features/admin/api";
import { dayStartIso, PERIOD_OPTIONS, periodRange, type PeriodKey } from "@/features/admin/period";

export const Route = createFileRoute("/admin/_panel/")({ component: Dashboard });

function greeting() {
  const h = Number(new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: "America/Sao_Paulo" }).format(new Date()));
  return h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
}

function Dashboard() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const range = periodRange(period);
  const dash = useQuery(dashboardQuery(range.from, range.to));
  const pending = useQuery(pendingQuery);
  const settings = useQuery(settingsQuery);
  const today = todayLocal();
  // Visão operacional: hoje + 6 dias (chaves de consulta estáveis por dia).
  const week = useQuery(rangeQuery(dayStartIso(today), dayStartIso(addDaysLocal(today, 7))));
  const upcoming = week;
  const staleHours = settings.data?.pending_alert_hours ?? 24;
  const d = dash.data;
  const [now] = useState(() => Date.now());

  return (
    <AdminPage
      title={`${greeting()}!`}
      subtitle={capFirst(fmtDateLong(new Date()))}
      actions={
        <>
          <Segmented label="Período" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
          <ButtonLink to="/admin/agenda" search={{ novo: true }} size="sm">
            <Plus className="size-4" aria-hidden /> Novo agendamento
          </ButtonLink>
        </>
      }
    >
      {dash.isError ? <ErrorState error={dash.error} onRetry={() => dash.refetch()} /> : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {d ? (
          <>
            <Kpi label="Agendamentos hoje" value={d.today_count} icon={<CalendarDays className="size-4" />} hint={`${d.appointments_count} no período`} />
            <Kpi
              label="Aguardando confirmação"
              value={d.pending_count}
              icon={<Hourglass className="size-4" />}
              tone={d.pending_stale_count > 0 ? "warn" : "neutral"}
              hint={d.pending_stale_count > 0 ? `${d.pending_stale_count} há mais de ${staleHours} h` : "Bloqueiam o horário até sua decisão"}
            />
            <Kpi label="Receita recebida" value={fmtMoney(d.income_paid)} tone="good" hint={`Previsto no período: ${fmtMoney(d.expected_in_period)}`} />
            <Kpi
              label="Resultado operacional"
              value={fmtMoney(Number(d.income_paid) - Number(d.expenses_paid))}
              tone={Number(d.income_paid) - Number(d.expenses_paid) >= 0 ? "good" : "bad"}
              hint={`Recebido ${fmtMoney(d.income_paid)} − despesas pagas ${fmtMoney(d.expenses_paid)}`}
            />
          </>
        ) : (
          Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px] rounded-panel" />)
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        {/* Pendências */}
        <Card
          title={
            <span className="flex items-center gap-2">
              Pendentes de confirmação {pending.data?.length ? <span className="rounded-full bg-st-pending px-2 text-xs text-carbon">{pending.data.length}</span> : null}
            </span>
          }
          actions={
            <Link to="/admin/agendamentos" search={{ status: "pending" }} className="text-xs font-semibold text-steel-400 hover:text-pearl">
              Ver todas
            </Link>
          }
        >
          {pending.isPending ? (
            <Skeleton className="h-32" />
          ) : pending.isError ? (
            <ErrorState error={pending.error} onRetry={() => pending.refetch()} />
          ) : pending.data.length === 0 ? (
            <EmptyState title="Nenhuma solicitação pendente" icon={<CheckCheck className="size-5" />}>
              Novas solicitações do site aparecem aqui na hora.
            </EmptyState>
          ) : (
            <ul className="divide-y divide-white/5">
              {pending.data.slice(0, 6).map((a) => {
                const stale = now - new Date(a.created_at).getTime() > staleHours * 3600_000;
                const wa = waLink(a.customer_phone_snapshot, `Olá, ${a.customer_name_snapshot.split(" ")[0]}! Aqui é da Tassionero sobre sua solicitação ${a.public_code}.`);
                return (
                  <li key={a.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center">
                    <Link to="/admin/agendamentos/$id" params={{ id: a.id }} className="min-w-0 flex-1 hover:opacity-90">
                      <p className="font-semibold">
                        {a.customer_name_snapshot} <span className="font-normal text-steel-500">· {a.vehicle_snapshot}</span>
                      </p>
                      <p className="text-sm text-steel-400">
                        {fmtDateLong(a.starts_at)}, {fmtTime(a.starts_at)} · {a.appointment_items.map((i) => i.service_name_snapshot).join(", ")}
                      </p>
                      <p className={stale ? "mt-0.5 flex items-center gap-1 text-xs font-semibold text-warn" : "mt-0.5 text-xs text-steel-500"}>
                        {stale ? <AlertTriangle className="size-3.5" aria-hidden /> : null} Pedido {fmtSince(a.created_at)}
                      </p>
                    </Link>
                    <div className="flex items-center gap-2">
                      {wa ? (
                        <a href={wa} target="_blank" rel="noopener noreferrer" aria-label="Abrir WhatsApp do cliente" className="grid size-9 place-items-center rounded-control bg-whatsapp/15 text-whatsapp ring-1 ring-whatsapp/30 hover:bg-whatsapp/25">
                          <MessageCircle className="size-4" />
                        </a>
                      ) : null}
                      <StatusActions id={a.id} status={a.status} only={["confirmed", "rejected"]} />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        {/* Próximos */}
        <Card title="Próximos agendamentos" actions={<Link to="/admin/agenda" className="text-xs font-semibold text-steel-400 hover:text-pearl">Agenda</Link>}>
          {upcoming.isPending ? (
            <Skeleton className="h-32" />
          ) : upcoming.isError ? (
            <ErrorState error={upcoming.error} onRetry={() => upcoming.refetch()} />
          ) : (
            (() => {
              const list = upcoming.data.appointments.filter((a) => ["confirmed", "in_progress", "pending"].includes(a.status) && new Date(a.ends_at).getTime() >= now);
              return list.length === 0 ? (
                <EmptyState title="Agenda livre nos próximos dias" icon={<CalendarClock className="size-5" />} />
              ) : (
                <ul className="space-y-2">
                  {list.slice(0, 7).map((a) => (
                    <li key={a.id}>
                      <Link to="/admin/agendamentos/$id" params={{ id: a.id }} className="flex items-center gap-3 rounded-control px-2 py-2 hover:bg-white/[0.04]">
                        <span className="w-14 shrink-0 text-center">
                          <span className="block text-sm font-bold tabular-nums">{fmtTime(a.starts_at)}</span>
                          <span className="block text-[11px] text-steel-500">{fmtDate(a.starts_at, "dd/MM")}</span>
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-semibold">{a.customer_name_snapshot}</span>
                          <span className="block truncate text-xs text-steel-500">
                            {a.appointment_items.map((i) => i.service_name_snapshot).join(", ")} · {fmtDuration(Math.round((new Date(a.ends_at).getTime() - new Date(a.starts_at).getTime()) / 60000))}
                          </span>
                        </span>
                        <StatusChip status={a.status} />
                      </Link>
                    </li>
                  ))}
                </ul>
              );
            })()
          )}
        </Card>
      </div>

      {/* Agenda da semana */}
      <Card
        title="Próximos 7 dias"
        actions={
          <Link to="/admin/agenda" className="inline-flex items-center gap-1 text-xs font-semibold text-steel-400 hover:text-pearl">
            Abrir agenda <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        }
      >
        {week.data ? <WeekGrid weekStartDate={today} appointments={week.data.appointments.filter((a) => a.status !== "rejected" && a.status !== "cancelled")} blocks={week.data.blocks} /> : <Skeleton className="h-96" />}
      </Card>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Receitas e despesas (12 meses)" className="lg:col-span-2">
          {d ? <IncomeExpenseChart data={d.monthly} /> : <Skeleton className="h-56" />}
        </Card>
        <div className="space-y-5">
          <Card title="Financeiro do período">
            {d ? (
              <dl className="space-y-2.5 text-sm">
                <Row k="Recebido" v={fmtMoney(d.income_paid)} />
                <Row k="Despesas pagas" v={fmtMoney(d.expenses_paid)} />
                <Row k="Despesas a pagar" v={fmtMoney(d.expenses_due)} />
                <Row k="A receber de clientes" v={fmtMoney(d.receivable)} />
                <Row k="Serviços concluídos" v={String(d.completed_count)} />
              </dl>
            ) : (
              <Skeleton className="h-32" />
            )}
            <p className="mt-3 text-xs text-steel-500">Agendamento não é receita: só entra o que foi registrado como recebido.</p>
          </Card>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Serviços mais realizados">
          {d ? <HBarList rows={d.top_services.map((s) => ({ label: s.name, value: Number(s.count) }))} empty="Nenhum serviço concluído no período." /> : <Skeleton className="h-40" />}
        </Card>
        <Card title="Agendamentos por semana">
          {d ? <ColumnSeries rows={d.by_week.map((w) => ({ label: `${w.week.slice(8, 10)}/${w.week.slice(5, 7)}`, value: Number(w.count) }))} /> : <Skeleton className="h-40" />}
        </Card>
      </div>
    </AdminPage>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-steel-400">{k}</dt>
      <dd className="font-semibold tabular-nums">{v}</dd>
    </div>
  );
}
