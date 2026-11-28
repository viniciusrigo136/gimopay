import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { Field, Textarea } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import { NEXT_ACTIONS, STATUS_LABEL } from "@/domain/status";
import type { AppointmentStatus } from "@/domain/types";
import { adminKeys, ownerOps } from "../api";

/** Botões de mudança de status com confirmação para ações que liberam o horário. */
export function StatusActions({ id, status, size = "sm", only }: { id: string; status: AppointmentStatus; size?: "sm" | "md"; only?: AppointmentStatus[] }) {
  const qc = useQueryClient();
  const [confirm, setConfirm] = useState<AppointmentStatus | null>(null);
  const [note, setNote] = useState("");
  const mutation = useMutation({
    mutationFn: ({ to, note }: { to: AppointmentStatus; note: string }) => ownerOps.setStatus(id, to, note),
    onSuccess: (_d, v) => {
      toast.success(`Status alterado para ${STATUS_LABEL[v.to].toLowerCase()}.`);
      setConfirm(null);
      setNote("");
      void qc.invalidateQueries({ queryKey: adminKeys.all });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const actions = NEXT_ACTIONS[status].filter((a) => !only || only.includes(a.to));
  if (!actions.length) return null;
  const needsConfirm = (to: AppointmentStatus) => to === "rejected" || to === "cancelled" || to === "completed";

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button
            key={a.to}
            size={size}
            variant={a.tone === "primary" ? "primary" : a.tone === "danger" ? "danger" : "secondary"}
            loading={mutation.isPending && mutation.variables?.to === a.to}
            disabled={mutation.isPending}
            onClick={() => (needsConfirm(a.to) ? setConfirm(a.to) : mutation.mutate({ to: a.to, note: "" }))}
          >
            {a.label}
          </Button>
        ))}
      </div>
      <Dialog
        open={!!confirm}
        onClose={() => setConfirm(null)}
        size="sm"
        title={confirm ? `${STATUS_LABEL[confirm]}: confirmar?` : ""}
        description={
          confirm === "completed"
            ? "Se o serviço terminou antes do previsto, o restante do horário volta a ficar livre."
            : "O horário será liberado na agenda. Avise o cliente pelo WhatsApp."
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirm(null)}>
              Voltar
            </Button>
            <Button variant={confirm === "completed" ? "primary" : "danger"} loading={mutation.isPending} onClick={() => confirm && mutation.mutate({ to: confirm, note })}>
              {confirm ? `Marcar como ${STATUS_LABEL[confirm].toLowerCase()}` : ""}
            </Button>
          </>
        }
      >
        <Field label="Observação (opcional, fica no histórico)" htmlFor="status-note">
          <Textarea id="status-note" value={note} onChange={(e) => setNote(e.target.value)} maxLength={300} />
        </Field>
      </Dialog>
    </>
  );
}
