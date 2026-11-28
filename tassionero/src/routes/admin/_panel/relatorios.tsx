import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ErrorState, Skeleton } from "@/components/ui/feedback";
import { BOOKING_METHOD_LABEL, MONEY_METHOD_LABEL, PAYMENT_STATUS_LABEL, STATUS_LABEL } from "@/domain/status";
import type { MoneyMethod } from "@/domain/types";
import { downloadCsv } from "@/lib/csv";
import { fmtDateTime } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";
import { AdminPage, Card, Kpi, Segmented } from "@/features/admin/components/AdminPage";
import { HBarList, IncomeExpenseChart } from "@/features/admin/components/charts";
import { appointmentsQuery, dashboardQuery, financeReportQuery } from "@/features/admin/api";
import { dayStartIso, PERIOD_OPTIONS, periodRange, type PeriodKey } from "@/features/admin/period";

export const Route = createFileRoute("/admin/_panel/relatorios")({ component: ReportsPage });

function ReportsPage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const r = periodRange(period);
  const report = useQuery(financeReportQuery(r.from, r.to));
  const dash = useQuery(dashboardQuery(r.from, r.to));
  const appts = useQuery(appointmentsQuery({ status: "all", from: dayStartIso(r.from), to: dayStartIso(r.to) }));
  const d = dash.data;

  return (
    <AdminPage
      title="Relatórios"
      subtitle="Receita reconhecida pelos pagamentos registrados, rateada entre os serviços de cada agendamento."
      actions={
        <>
          <Segmented label="Período" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
          <Button size="sm" variant="secondary" disabled={!appts.data?.length} onClick={() => downloadCsv(`agendamentos-${r.from}.csv`, [
            ["Código", "Início", "Cliente", "Telefone", "Veículo", "Serviços", "Status", "Pagamento", "Situação", "Referência", "Valor final", "Recebido"],
            ...(appts.data ?? []).map((a) => [a.public_code, fmtDateTime(a.starts_at), a.customer_name_snapshot, a.customer_phone_snapshot, a.vehicle_snapshot, a.appointment_items.map((i) => i.service_name_snapshot).join(" + "), STATUS_LABEL[a.status], BOOKING_METHOD_LABEL[a.payment_method], PAYMENT_STATUS_LABEL[a.payment_status], a.reference_total === null ? "" : Number(a.reference_total), a.final_total === null ? "" : Number(a.final_total), Number(a.amount_paid)]),
          ])}>
            <Download className="size-4" aria-hidden /> Agendamentos (CSV)
          </Button>
        </>
      }
    >
      {report.isError ? <ErrorState error={report.error} onRetry={() => report.refetch()} /> : null}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {d ? (
          <>
            <Kpi label="Agendamentos no período" value={d.appointments_count} />
            <Kpi label="Concluídos" value={d.completed_count} />
            <Kpi label="Receita recebida" value={fmtMoney(d.income_paid)} tone="good" />
            <Kpi label="Previsto (não é receita)" value={fmtMoney(d.expected_in_period)} hint="Soma de valores finais/referência dos agendamentos" />
          </>
        ) : Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-[118px] rounded-panel" />)}
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Receita por serviço">
          {report.data ? <HBarList rows={report.data.income_by_service.map((x) => ({ label: x.name, value: Number(x.amount) }))} format={fmtMoney} empty="Nenhum pagamento de agendamento no período." /> : <Skeleton className="h-40" />}
          {report.data && Number(report.data.income_manual) > 0 ? <p className="mt-3 text-xs text-steel-500">Receitas avulsas (sem agendamento): {fmtMoney(report.data.income_manual)}</p> : null}
        </Card>
        <Card title="Despesas por categoria">
          {report.data ? <HBarList rows={report.data.expenses_by_category.map((x) => ({ label: x.category, value: Number(x.amount) }))} format={fmtMoney} empty="Nenhuma despesa paga no período." /> : <Skeleton className="h-40" />}
        </Card>
        <Card title="Recebimentos por forma de pagamento">
          {report.data ? <HBarList rows={report.data.by_method.map((x) => ({ label: MONEY_METHOD_LABEL[x.method as MoneyMethod] ?? x.method, value: Number(x.amount) }))} format={fmtMoney} /> : <Skeleton className="h-40" />}
        </Card>
        <Card title="Receitas e despesas (12 meses)">
          {d ? <IncomeExpenseChart data={d.monthly} /> : <Skeleton className="h-56" />}
        </Card>
      </div>
    </AdminPage>
  );
}
