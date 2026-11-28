import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { m } from "motion/react";
import { Banknote, Check, Copy, Hourglass, MessageCircle, QrCode } from "lucide-react";
import { Button, ButtonLink, ExternalButton } from "@/components/ui/Button";
import { EmptyState, ErrorState, Notice, Skeleton } from "@/components/ui/feedback";
import { StatusChip } from "@/components/ui/StatusChip";
import { msgCancelRequest, msgSendPixReceipt, waLink } from "@/domain/whatsapp";
import { publicAppointmentQuery } from "@/features/booking/api";
import { fmtDateLong, fmtDuration, fmtTime } from "@/lib/datetime";
import { fmtMoney } from "@/lib/money";

export const Route = createFileRoute("/_site/agendamento/confirmacao")({
  validateSearch: z.object({ codigo: z.string().max(12).optional() }),
  head: () => ({ meta: [{ title: "Solicitação enviada | Tassionero" }, { name: "robots", content: "noindex" }] }),
  // Dados do pedido só no navegador (código na URL; nada indexado ou cacheado no servidor).
  ssr: false,
  component: ConfirmationPage,
});

const PIX_TYPE: Record<string, string> = { cpf: "CPF", cnpj: "CNPJ", email: "E-mail", phone: "Telefone", random: "Chave aleatória" };

function ConfirmationPage() {
  const { codigo } = Route.useSearch();
  const q = useQuery({ ...publicAppointmentQuery(codigo ?? ""), enabled: !!codigo });
  const [copied, setCopied] = useState(false);

  if (!codigo) {
    return (
      <Shell>
        <EmptyState title="Nenhuma solicitação informada" action={<ButtonLink to="/agendar">Agendar serviço</ButtonLink>} />
      </Shell>
    );
  }
  if (q.isPending) {
    return (
      <Shell>
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="mt-6 h-64" />
      </Shell>
    );
  }
  if (q.isError) return <Shell><ErrorState error={q.error} onRetry={() => q.refetch()} /></Shell>;
  const a = q.data;
  if (!a) {
    return (
      <Shell>
        <EmptyState title="Solicitação não encontrada">Confira o código ou fale com a gente pelo WhatsApp.</EmptyState>
      </Shell>
    );
  }

  const value = a.final_total ?? a.reference_total;
  const waPix = waLink(a.whatsapp_phone, msgSendPixReceipt(a.public_code));
  const waCancel = waLink(a.whatsapp_phone, msgCancelRequest(a.public_code));

  const copyPix = async () => {
    if (!a.pix) return;
    try {
      await navigator.clipboard.writeText(a.pix.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <Shell>
      <m.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <div className="flex items-center gap-3">
          <span className="grid size-12 place-items-center rounded-full bg-st-pending/15 text-st-pending">
            <Hourglass className="size-6" aria-hidden />
          </span>
          <div>
            <p className="text-sm text-steel-400">Solicitação enviada</p>
            <h1 className="text-title font-extrabold">
              {a.status === "pending" ? "Aguardando confirmação da Tassionero" : "Situação da sua solicitação"}
            </h1>
          </div>
        </div>

        <Notice tone="warn" className="mt-6">
          Seu horário está reservado, mas <strong className="text-pearl">o agendamento só está confirmado depois do nosso retorno pelo WhatsApp</strong>.
        </Notice>

        <div className="mt-6 rounded-panel bg-graphite-800 ring-1 ring-white/[0.06]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-5 py-4">
            <div>
              <p className="text-xs text-steel-400">Código da reserva</p>
              <p className="font-mono text-2xl font-bold tracking-widest">{a.public_code}</p>
            </div>
            <StatusChip status={a.status} />
          </div>
          <dl className="divide-y divide-white/5 text-sm">
            <Row k="Serviço(s)" v={a.items.map((i) => i.name).join(", ")} />
            <Row k="Veículo" v={a.vehicle} />
            <Row k="Data" v={fmtDateLong(a.starts_at)} />
            <Row k="Horário" v={`${fmtTime(a.starts_at)} às ${fmtTime(a.ends_at)}`} />
            <Row k="Duração prevista" v={fmtDuration(a.duration_minutes)} />
            <Row k={a.final_total !== null ? "Valor combinado" : "Valor de referência"} v={value === null ? "Sob avaliação" : `${fmtMoney(value)}${a.is_estimate && a.final_total === null ? " (pode variar após avaliação)" : ""}`} />
            <Row k="Pagamento" v={a.payment_method === "pix" ? "Pix" : "Dinheiro"} />
          </dl>
        </div>

        {a.payment_method === "pix" ? (
          <section aria-labelledby="pix" className="mt-6 rounded-panel bg-graphite-800 p-5 ring-1 ring-white/[0.06]">
            <h2 id="pix" className="flex items-center gap-2 font-bold">
              <QrCode className="size-5 text-racing-400" aria-hidden /> Pagamento por Pix
            </h2>
            {a.pix ? (
              <>
                <div className="mt-4 rounded-control bg-graphite-900 p-4 ring-1 ring-white/[0.06]">
                  <p className="text-xs text-steel-400">{a.pix.key_type ? PIX_TYPE[a.pix.key_type] : "Chave Pix"}</p>
                  <p className="mt-1 font-mono text-lg font-semibold break-all">{a.pix.key}</p>
                  {a.pix.holder_name ? <p className="mt-1 text-xs text-steel-400">Titular: {a.pix.holder_name}</p> : null}
                </div>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button variant="secondary" onClick={copyPix} aria-live="polite">
                    {copied ? <Check className="size-4 text-ok" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                    {copied ? "Chave copiada" : "Copiar chave Pix"}
                  </Button>
                  {waPix ? (
                    <ExternalButton href={waPix}>
                      <MessageCircle className="size-4" aria-hidden /> Enviar comprovante pelo WhatsApp
                    </ExternalButton>
                  ) : null}
                </div>
              </>
            ) : (
              <Notice className="mt-3">A chave Pix será enviada pelo WhatsApp junto com a confirmação.</Notice>
            )}
            <p className="mt-4 text-sm text-steel-400">
              O pagamento é conferido manualmente pela Tassionero. Se o valor depender de avaliação, aguarde a confirmação antes de pagar.
            </p>
          </section>
        ) : (
          <section aria-labelledby="cash" className="mt-6 rounded-panel bg-graphite-800 p-5 ring-1 ring-white/[0.06]">
            <h2 id="cash" className="flex items-center gap-2 font-bold">
              <Banknote className="size-5 text-racing-400" aria-hidden /> Pagamento em dinheiro
            </h2>
            <p className="mt-2 text-sm text-steel-300">O pagamento é presencial, na entrega do veículo, conforme combinado com a Tassionero.</p>
          </section>
        )}

        {a.payment_instructions ? <p className="mt-4 text-sm whitespace-pre-line text-steel-400">{a.payment_instructions}</p> : null}

        <div className="mt-8 flex flex-col gap-3 border-t border-white/5 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-steel-400">Precisa cancelar ou remarcar? O pedido é feito pelo WhatsApp.</p>
          <div className="flex gap-3">
            {waCancel ? (
              <ExternalButton href={waCancel} variant="ghost" size="sm">
                Pedir cancelamento
              </ExternalButton>
            ) : null}
            <Link to="/" className="inline-flex h-9 items-center px-3 text-sm font-semibold whitespace-nowrap text-steel-300 hover:text-pearl">
              Voltar ao início
            </Link>
          </div>
        </div>
        <p className="mt-4 text-xs text-steel-500">Guarde o código {a.public_code}. Esta página pode ser aberta de novo pelo mesmo link.</p>
      </m.div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-4 pt-28 pb-16 sm:px-6">{children}</div>;
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-4 px-5 py-3">
      <dt className="text-steel-400">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}
