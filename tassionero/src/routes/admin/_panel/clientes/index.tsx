import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { Search, Users } from "lucide-react";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/fields";
import { fmtDate } from "@/lib/datetime";
import { fmtPhone } from "@/lib/phone";
import { AdminPage, Card } from "@/features/admin/components/AdminPage";
import { customersQuery } from "@/features/admin/api";

export const Route = createFileRoute("/admin/_panel/clientes/")({ component: CustomersPage });

function CustomersPage() {
  const [term, setTerm] = useState("");
  const deferred = useDeferredValue(term);
  const list = useQuery(customersQuery(deferred));
  return (
    <AdminPage title="Clientes" subtitle="Cadastro mínimo: nome, telefone e veículos.">
      <Card bodyClass="p-4 sm:p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel-500" aria-hidden />
          <Input aria-label="Buscar por nome ou telefone" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Nome ou telefone" className="pl-9" />
        </div>
        {list.isPending ? <Skeleton className="h-72" /> : list.isError ? <ErrorState error={list.error} onRetry={() => list.refetch()} /> : list.data.length === 0 ? (
          <EmptyState title={deferred ? "Nenhum cliente encontrado" : "Nenhum cliente ainda"} icon={<Users className="size-5" />}>Clientes são cadastrados automaticamente quando fazem um pedido pelo site.</EmptyState>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead><tr className="border-b border-white/5 text-left text-xs text-steel-500"><th className="py-2 font-medium">Nome</th><th className="font-medium">Telefone</th><th className="font-medium">Veículos</th><th className="font-medium">Agendamentos</th><th className="font-medium">Desde</th></tr></thead>
              <tbody>
                {list.data.map((c) => (
                  <tr key={c.id} className="relative border-b border-white/5 hover:bg-white/[0.03]">
                    <td className="py-3"><Link to="/admin/clientes/$id" params={{ id: c.id }} className="font-semibold after:absolute after:inset-0">{c.name}</Link></td>
                    <td className="text-steel-300">{fmtPhone(c.phone)}</td>
                    <td>{c.vehicles.length}</td>
                    <td>{c.appointments.length}</td>
                    <td className="text-steel-400">{fmtDate(c.created_at)}</td>
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
