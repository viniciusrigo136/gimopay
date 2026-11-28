import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Input, Select } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import type { Vehicle } from "@/domain/types";
import { adminCategoriesQuery, customerOps } from "../api";

export function VehicleDialog({ value, onClose, onSaved }: { value: Partial<Vehicle> | null; onClose: () => void; onSaved: () => void }) {
  const categories = useQuery({ ...adminCategoriesQuery, enabled: !!value });
  const [v, setV] = useState<Partial<Vehicle>>({});
  const current = { ...value, ...v };
  const m = useMutation({
    mutationFn: async () => {
      const row = {
        customer_id: current.customer_id as string,
        vehicle_category_id: current.vehicle_category_id as string,
        make: current.make ?? "",
        model: (current.model ?? "").trim(),
        year: current.year ? Number(current.year) : null,
        color: current.color ?? "",
        notes: current.notes ?? "",
      };
      if (!row.vehicle_category_id || row.model.length < 2) throw new Error("invalid_vehicle_model");
      return value?.id ? customerOps.updateVehicle(value.id, row) : customerOps.createVehicle(row);
    },
    onSuccess: () => { toast.success("Veículo salvo."); setV({}); onSaved(); onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open={!!value} onClose={() => { setV({}); onClose(); }} title={value?.id ? "Editar veículo" : "Novo veículo"} footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={m.isPending} onClick={() => m.mutate()}>Salvar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Categoria" htmlFor="vd-c"><Select id="vd-c" value={current.vehicle_category_id ?? ""} onChange={(e) => setV({ ...v, vehicle_category_id: e.target.value })}><option value="">Escolha…</option>{(categories.data ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</Select></Field>
        <Field label="Marca" htmlFor="vd-mk"><Input id="vd-mk" value={current.make ?? ""} onChange={(e) => setV({ ...v, make: e.target.value })} /></Field>
        <Field label="Modelo" htmlFor="vd-md"><Input id="vd-md" value={current.model ?? ""} onChange={(e) => setV({ ...v, model: e.target.value })} /></Field>
        <Field label="Ano (opcional)" htmlFor="vd-y"><Input id="vd-y" inputMode="numeric" value={current.year ?? ""} onChange={(e) => setV({ ...v, year: e.target.value ? Number(e.target.value.replace(/\D/g, "").slice(0, 4)) : null })} /></Field>
        <Field label="Cor (opcional)" htmlFor="vd-cor"><Input id="vd-cor" value={current.color ?? ""} onChange={(e) => setV({ ...v, color: e.target.value })} /></Field>
        <Field label="Observações" htmlFor="vd-o"><Input id="vd-o" value={current.notes ?? ""} onChange={(e) => setV({ ...v, notes: e.target.value })} /></Field>
      </div>
    </Dialog>
  );
}
