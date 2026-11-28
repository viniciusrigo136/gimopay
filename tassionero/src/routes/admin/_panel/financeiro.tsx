import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Download, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Select, Textarea } from "@/components/ui/fields";
import { errorMessage } from "@/domain/errors";
import { MONEY_METHOD_LABEL } from "@/domain/status";
import type { MoneyMethod, Transaction, TransactionStatus, TransactionType } from "@/domain/types";
import { fmtDate, localDateOf, localToIso, todayLocal } from "@/lib/datetime";
import { downloadCsv } from "@/lib/csv";
import { fmtMoney, parseMoney } from "@/lib/money";
import { cn } from "@/lib/cn";
import { AdminPage, Card, Kpi, Segmented } from "@/features/admin/components/AdminPage";
import { adminKeys, financeOps, transactionsQuery, type TransactionFilters } from "@/features/admin/api";
import { dayStartIso, PERIOD_OPTIONS, periodRange, type PeriodKey } from "@/features/admin/period";

export const Route = createFileRoute("/admin/_panel/financeiro")({ component: FinancePage });

const TYPE_LABEL: Record<TransactionType, string> = { income: "Receita", expense: "Despesa", refund: "Estorno" };
const STATUS_LABEL: Record<TransactionStatus, string> = { paid: "Pago", pending: "Pendente", cancelled: "Cancelado" };
const EXPENSE_CATEGORIES = ["Produtos", "Equipamentos", "Água e energia", "Aluguel", "Marketing", "Impostos e taxas", "Manutenção", "Outros"];

function FinancePage() {
  const [period, setPeriod] = useState<PeriodKey>("month");
  const range = periodRange(period);
  const [type, setType] = useState<TransactionFilters["type"]>("all");
  const [method, setMethod] = useState<TransactionFilters["method"]>("all");
  const [status, setStatus] = useState<TransactionFilters["status"]>("all");
  const filters: TransactionFilters = { from: dayStartIso(range.from), to: dayStartIso(range.to), type, method, status };
  const list = useQuery(transactionsQuery(filters));
  const [editing, setEditing] = useState<Transaction | "expense" | "income" | null>(null);
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: adminKeys.all });

  const rows = list.data ?? [];
  const paid = rows.filter((t) => t.status === "paid");
  const income = paid.filter((t) => t.type === "income").reduce((s, t) => s + Number(t.amount), 0) - paid.filter((t) => t.type === "refund").reduce((s, t) => s + Number(t.amount), 0);
  const expenses = paid.filter((t) => t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);
  const due = rows.filter((t) => t.status === "pending" && t.type === "expense").reduce((s, t) => s + Number(t.amount), 0);

  const markPaid = useMutation({
    mutationFn: (t: Transaction) => financeOps.save(t.id, { ...stripTx(t), status: "paid", paid_at: new Date().toISOString() }),
    onSuccess: () => { toast.success("Marcado como pago."); void invalidate(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  const remove = useMutation({
    mutationFn: (id: string) => financeOps.remove(id),
    onSuccess: () => { toast.success("Lançamento excluído."); void invalidate(); },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <AdminPage
      title="Financeiro"
      subtitle="Resultado gerencial = receitas recebidas − despesas pagas. Agendamentos só viram receita quando o pagamento é registrado."
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => setEditing("income")}><Plus className="size-4" aria-hidden /> Receita avulsa</Button>
          <Button size="sm" onClick={() => setEditing("expense")}><Plus className="size-4" aria-hidden /> Despesa</Button>
        </>
      }
    >
      <div className="flex flex-wrap items-center gap-3">
        <Segmented label="Período" value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        <Select aria-label="Tipo" className="w-auto" value={type} onChange={(e) => setType(e.target.value as TransactionFilters["type"])}>
          <option value="all">Todos os tipos</option><option value="income">Receitas</option><option value="expense">Despesas</option><option value="refund">Estornos</option>
        </Select>
        <Select aria-label="Forma de pagamento" className="w-auto" value={method} onChange={(e) => setMethod(e.target.value as TransactionFilters["method"])}>
          <option value="all">Todas as formas</option>
          {(Object.keys(MONEY_METHOD_LABEL) as MoneyMethod[]).map((k) => <option key={k} value={k}>{MONEY_METHOD_LABEL[k]}</option>)}
        </Select>
        <Select aria-label="Status" className="w-auto" value={status} onChange={(e) => setStatus(e.target.value as TransactionFilters["status"])}>
          <option value="all">Todos os status</option><option value="paid">Pagos</option><option value="pending">Pendentes</option><option value="cancelled">Cancelados</option>
        </Select>
        <Button size="sm" variant="ghost" disabled={!rows.length} onClick={() => downloadCsv(`financeiro-${range.from}.csv`, [
          ["Data", "Tipo", "Descrição", "Categoria", "Forma", "Status", "Vencimento", "Valor", "Agendamento"],
          ...rows.map((t) => [t.paid_at ? fmtDate(t.paid_at) : "", TYPE_LABEL[t.type], t.description, t.category, t.payment_method ? MONEY_METHOD_LABEL[t.payment_method] : "", STATUS_LABEL[t.status], t.due_date ? fmtDate(`${t.due_date}T12:00:00-03:00`) : "", (t.type === "income" ? 1 : -1) * Number(t.amount), t.appointments?.public_code ?? ""]),
        ])}>
          <Download className="size-4" aria-hidden /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Recebido" value={fmtMoney(income)} tone="good" hint="Receitas pagas − estornos" />
        <Kpi label="Despesas pagas" value={fmtMoney(expenses)} />
        <Kpi label="Resultado operacional" value={fmtMoney(income - expenses)} tone={income - expenses >= 0 ? "good" : "bad"} hint="Base: pagamentos efetivos do período" />
        <Kpi label="Despesas a pagar" value={fmtMoney(due)} tone={due > 0 ? "warn" : "neutral"} />
      </div>

      <Card bodyClass="p-0">
        {list.isPending ? <Skeleton className="m-5 h-72" /> : list.isError ? <ErrorState className="m-5" error={list.error} onRetry={() => list.refetch()} /> : rows.length === 0 ? (
          <div className="p-5"><EmptyState title="Nenhum lançamento no período">Registre pagamentos nos agendamentos ou adicione despesas.</EmptyState></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead><tr className="border-b border-white/5 text-left text-xs text-steel-500"><th className="px-5 py-3 font-medium">Data</th><th className="font-medium">Descrição</th><th className="font-medium">Categoria</th><th className="font-medium">Forma</th><th className="font-medium">Status</th><th className="text-right font-medium">Valor</th><th className="px-5" /></tr></thead>
              <tbody>
                {rows.map((t) => (
                  <tr key={t.id} className="border-b border-white/5">
                    <td className="px-5 py-3 whitespace-nowrap text-steel-300">{t.paid_at ? fmtDate(t.paid_at) : t.due_date ? `vence ${fmtDate(`${t.due_date}T12:00:00-03:00`)}` : "—"}</td>
                    <td>
                      <span className="block font-medium">{t.description}</span>
                      {t.appointments ? <Link to="/admin/agendamentos/$id" params={{ id: t.appointments.id }} className="text-xs text-steel-500 hover:underline">{t.appointments.public_code}</Link> : <span className="text-xs text-steel-500">{TYPE_LABEL[t.type]}</span>}
                    </td>
                    <td className="text-steel-400">{t.category || "—"}</td>
                    <td className="text-steel-400">{t.payment_method ? MONEY_METHOD_LABEL[t.payment_method] : "—"}</td>
                    <td><span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", t.status === "paid" ? "bg-ok/15 text-ok" : t.status === "pending" ? "bg-warn/15 text-warn" : "bg-white/5 text-steel-400")}>{STATUS_LABEL[t.status]}</span></td>
                    <td className={cn("text-right font-semibold tabular-nums", t.type === "income" ? "text-pearl" : "text-danger")}>{t.type === "income" ? "" : "−"}{fmtMoney(t.amount)}</td>
                    <td className="px-5 text-right whitespace-nowrap">
                      {t.status === "pending" ? <Button size="sm" variant="ghost" aria-label="Marcar como pago" onClick={() => markPaid.mutate(t)}><CheckCircle2 className="size-4" /></Button> : null}
                      {!t.appointment_id ? (
                        <>
                          <Button size="sm" variant="ghost" onClick={() => setEditing(t)}>Editar</Button>
                          <Button size="sm" variant="ghost" aria-label="Excluir lançamento" onClick={() => { if (window.confirm("Excluir este lançamento?")) remove.mutate(t.id); }}><Trash2 className="size-4" /></Button>
                        </>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="text-xs text-steel-500">Pagamentos de agendamentos não são editados aqui: use o agendamento (registro de pagamento ou estorno explícito).</p>
      {editing ? <TransactionDialog value={editing} onClose={() => setEditing(null)} onSaved={() => void invalidate()} /> : null}
    </AdminPage>
  );
}

function stripTx(t: Transaction) {
  return { type: t.type, description: t.description, category: t.category, amount: t.amount, payment_method: t.payment_method, status: t.status, due_date: t.due_date, paid_at: t.paid_at, notes: t.notes, appointment_id: t.appointment_id };
}

function TransactionDialog({ value, onClose, onSaved }: { value: Transaction | "expense" | "income"; onClose: () => void; onSaved: () => void }) {
  const t = typeof value === "string" ? null : value;
  const kind: TransactionType = t?.type ?? (value as TransactionType);
  const [f, setF] = useState({
    description: t?.description ?? "",
    category: t?.category ?? (kind === "expense" ? "Produtos" : "Serviços"),
    amount: t ? String(t.amount).replace(".", ",") : "",
    method: (t?.payment_method ?? "pix") as MoneyMethod,
    status: (t?.status ?? "paid") as TransactionStatus,
    date: t?.paid_at ? localDateOf(t.paid_at) : todayLocal(),
    due: t?.due_date ?? "",
    notes: t?.notes ?? "",
  });
  const save = useMutation({
    mutationFn: () => {
      const amount = parseMoney(f.amount);
      if (!amount) throw new Error("invalid_amount");
      return financeOps.save(t?.id ?? null, {
        type: kind,
        description: f.description.trim(),
        category: f.category,
        amount,
        payment_method: f.method,
        status: f.status,
        paid_at: f.status === "paid" ? localToIso(f.date, "12:00") : null,
        due_date: f.status === "pending" ? f.due || null : null,
        notes: f.notes,
      });
    },
    onSuccess: () => { toast.success("Lançamento salvo."); onSaved(); onClose(); },
    onError: (e) => toast.error(errorMessage(e)),
  });
  return (
    <Dialog open onClose={onClose} title={`${t ? "Editar" : "Nova"} ${kind === "expense" ? "despesa" : "receita avulsa"}`}
      footer={<><Button variant="ghost" onClick={onClose}>Cancelar</Button><Button loading={save.isPending} disabled={f.description.trim().length < 2} onClick={() => save.mutate()}>Salvar</Button></>}>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Descrição" htmlFor="tx-d" className="sm:col-span-2"><Input id="tx-d" value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} /></Field>
        <Field label="Categoria" htmlFor="tx-c">
          {kind === "expense" ? (
            <Select id="tx-c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })}>{EXPENSE_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</Select>
          ) : <Input id="tx-c" value={f.category} onChange={(e) => setF({ ...f, category: e.target.value })} />}
        </Field>
        <Field label="Valor (R$)" htmlFor="tx-a"><Input id="tx-a" inputMode="decimal" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
        <Field label="Forma" htmlFor="tx-m"><Select id="tx-m" value={f.method} onChange={(e) => setF({ ...f, method: e.target.value as MoneyMethod })}>{(Object.keys(MONEY_METHOD_LABEL) as MoneyMethod[]).map((k) => <option key={k} value={k}>{MONEY_METHOD_LABEL[k]}</option>)}</Select></Field>
        <Field label="Status" htmlFor="tx-s"><Select id="tx-s" value={f.status} onChange={(e) => setF({ ...f, status: e.target.value as TransactionStatus })}><option value="paid">{kind === "expense" ? "Paga" : "Recebida"}</option><option value="pending">{kind === "expense" ? "A pagar" : "A receber"}</option><option value="cancelled">Cancelada</option></Select></Field>
        {f.status === "paid" ? <Field label={kind === "expense" ? "Data do pagamento" : "Data do recebimento"} htmlFor="tx-dt"><Input id="tx-dt" type="date" value={f.date} onChange={(e) => setF({ ...f, date: e.target.value })} /></Field> : null}
        {f.status === "pending" ? <Field label="Vencimento" htmlFor="tx-due"><Input id="tx-due" type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field> : null}
        <Field label="Observações" htmlFor="tx-n" className="sm:col-span-2"><Textarea id="tx-n" value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} /></Field>
      </div>
    </Dialog>
  );
}
