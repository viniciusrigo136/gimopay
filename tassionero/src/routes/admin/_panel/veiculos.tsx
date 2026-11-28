import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";
import { Car, Search } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Input } from "@/components/ui/fields";
import { fmtPhone } from "@/lib/phone";
import { AdminPage, Card } from "@/features/admin/components/AdminPage";
import { adminKeys, vehiclesQuery, type VehicleRow } from "@/features/admin/api";
import { VehicleDialog } from "@/features/admin/components/VehicleDialog";

export const Route = createFileRoute("/admin/_panel/veiculos")({ component: VehiclesPage });

function VehiclesPage() {
  const [term, setTerm] = useState("");
  const deferred = useDeferredValue(term);
  const list = useQuery(vehiclesQuery(deferred));
  const [edit, setEdit] = useState<VehicleRow | null>(null);
  const qc = useQueryClient();
  return (
    <AdminPage title="Veículos" subtitle="Placa não é coletada. Use marca, modelo e cor para identificar.">
      <Card bodyClass="p-4 sm:p-5">
        <div className="relative mb-4 max-w-sm">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-steel-500" aria-hidden />
          <Input aria-label="Buscar veículos" value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Marca, modelo ou cor" className="pl-9" />
        </div>
        {list.isPending ? <Skeleton className="h-72" /> : list.isError ? <ErrorState error={list.error} onRetry={() => list.refetch()} /> : list.data.length === 0 ? (
          <EmptyState title="Nenhum veículo encontrado" icon={<Car className="size-5" />} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-white/5 text-left text-xs text-steel-500"><th className="py-2 font-medium">Veículo</th><th className="font-medium">Categoria</th><th className="font-medium">Ano / cor</th><th className="font-medium">Cliente</th><th /></tr></thead>
              <tbody>
                {list.data.map((v) => (
                  <tr key={v.id} className="border-b border-white/5">
                    <td className="py-3 font-semibold">{[v.make, v.model].filter(Boolean).join(" ")}</td>
                    <td className="text-steel-300">{v.vehicle_categories?.name}</td>
                    <td className="text-steel-400">{[v.year, v.color].filter(Boolean).join(" · ") || "—"}</td>
                    <td>{v.customers ? <Link to="/admin/clientes/$id" params={{ id: v.customers.id }} className="hover:underline">{v.customers.name} <span className="text-steel-500">{fmtPhone(v.customers.phone)}</span></Link> : "—"}</td>
                    <td className="text-right"><Button size="sm" variant="ghost" onClick={() => setEdit(v)}>Editar</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <VehicleDialog value={edit} onClose={() => setEdit(null)} onSaved={() => void qc.invalidateQueries({ queryKey: adminKeys.all })} />
    </AdminPage>
  );
}
