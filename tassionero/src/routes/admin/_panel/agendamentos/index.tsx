import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Search } from "lucide-react";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/fields";
import { StatusChip } from "@/components/ui/StatusChip";
import { BOOKING_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/domain/status";
import { fmtDateTime, fmtSince } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";
import { fmtPhone } from "@/lib/phone";
import { AdminPage, Card, Segmented } from "@/features/admin/components/AdminPage";
import { appointmentsQuery } from "@/features/admin/api";

const STATUS = ["pending", "active", "confirmed", "in_progress", "completed", "rejected", "cancelled", "all"] as const;

export const Route = createFileRoute("/admin/_panel/agendamentos/")({
  validateSearch: z.object({ status: z.enum(STATUS).optional(), q: z.string().optional() }),
  component: AppointmentsPage,
});

function AppointmentsPage() {
  const { status = "active", q = "" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const [term, setTerm] = useState(q);
  const list = useQuery(appointmentsQuery({ status, q }));

  return (
    <AdminPage title="Agendamentos" subtitle="Busque por nome, telefone, veículo ou código.">
      <Card bodyClass="p-4 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Segmented
            label="Filtrar por status"
            value={status}
            onChange={(v) => void navigate({ search: (s) => ({ ...s, status: v }) })}
            options={[
              { value: "pending", label: "Pendentes" },
              { value: "active", label: "Ativos" },
              { value: "confirmed", label: "Confirmados" },
              { value: "in_progress", label: "Em andamento" },
              { value: "completed", label: "Concluídos" },
              { value: "rejected", label: "Recusados" },
              { value: "cancelled", label: "Cancelados" },
              { value: "all", label: "Todos" },
            ]}
          />
          <form
            role="search"
            onSubmit={(e) => {
              e.preventDefault();
              void navigate({ search: (s) => ({ ...s, q: term || undefined }) });
            }}
            className="relative w-full lg:w-72"
          >
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel-500" aria-hidden />
            <Input aria-label="Buscar agendamentos" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Buscar…" className="pl-9" />
          </form>
        </div>
        {list.isPending ? (
          <Skeleton className="h-72" />
        ) : list.isError ? (
          <ErrorState error={list.error} onRetry={() => list.refetch()} />
        ) : list.data.length === 0 ? (
          <EmptyState title="Nenhum agendamento encontrado">Ajuste o filtro ou a busca.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-white/5 text-left text-xs text-steel-500">
                  <th className="py-2 font-medium">Data</th>
                  <th className="font-medium">Cliente</th>
                  <th className="font-medium">Serviços</th>
                  <th className="font-medium">Status</th>
                  <th className="font-medium">Pagamento</th>
                  <th className="text-right font-medium">Valor</th>
                </tr>
              </thead>
              <tbody>
                {list.data.map((a) => (
                  <tr key={a.id} className="group relative border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="py-3 pr-3 whitespace-nowrap">
                      <Link to="/admin/agendamentos/$id" params={{ id: a.id }} className="font-semibold after:absolute after:inset-0">
                        {fmtDateTime(a.starts_at)}
                      </Link>
                      <span className="block text-xs text-steel-500">{a.public_code}</span>
                    </td>
                    <td className="pr-3">
                      <span className="block font-medium">{a.customer_name_snapshot}</span>
                      <span className="block text-xs text-steel-500">{fmtPhone(a.customer_phone_snapshot)} · {a.vehicle_snapshot}</span>
                    </td>
                    <td className="max-w-56 truncate pr-3 text-steel-300">{a.appointment_items.map((i) => i.service_name_snapshot).join(", ")}</td>
                    <td className="pr-3">
                      <StatusChip status={a.status} />
                      {a.status === "pending" ? <span className="mt-1 block text-xs text-steel-500">{fmtSince(a.created_at)}</span> : null}
                    </td>
                    <td className="pr-3 text-xs">
                      <span className="block">{BOOKING_METHOD_LABEL[a.payment_method]}</span>
                      <span className="text-steel-500">{PAYMENT_STATUS_LABEL[a.payment_status]}</span>
                    </td>
                    <td className="text-right font-semibold tabular-nums">
                      {fmtMoney(a.final_total ?? a.reference_total)}
                      {a.final_total === null ? <span className="block text-xs font-normal text-steel-500">referência</span> : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </AdminPage>
  );
}
