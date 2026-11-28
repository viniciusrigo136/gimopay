import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient, useSuspenseQuery, type UseQueryResult } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import { ArrowLeft, ArrowRight, Banknote, Check, Clock, MessageCircle, QrCode, Send } from "lucide-react";
import { ServiceIcon } from "@/components/brand/icons";
import { Button, ExternalButton } from "@/components/ui/Button";
import { EmptyState, ErrorState, InlineError, Notice, Skeleton } from "@/components/ui/feedback";
import { Field, Input, Textarea } from "@/components/ui/fields";
import { MonthCalendar } from "@/components/ui/MonthCalendar";
import { errorMessage } from "@/domain/errors";
import type { PublicBusinessInfo, ServiceQuote, ServiceWithPrices, VehicleCategory } from "@/domain/types";
import { msgCheckAvailability, waLink } from "@/domain/whatsapp";
import { createBooking, quoteQuery, slotsQuery } from "@/features/booking/api";
import { contactSchema, type ContactValues } from "@/features/booking/schema";
import { priceDisplay } from "@/features/catalog/pricing";
import { businessInfoQuery, categoriesQuery, servicesQuery } from "@/features/catalog/queries";
import { addDaysLocal, fmtDateLong, fmtDuration, fmtTime, weekdayOf } from "@/lib/datetime";
import { cn } from "@/lib/cn";
import { fmtMoney } from "@/lib/money";
import { maskPhone } from "@/lib/phone";

const searchSchema = z.object({ servico: z.string().optional() });

export const Route = createFileRoute("/_site/agendar")({
  validateSearch: searchSchema,
  head: () => ({ meta: [{ title: "Agendar serviço | Tassionero Estética Automotiva" }, { name: "robots", content: "noindex" }] }),
  loader: ({ context: { queryClient } }) => Promise.all([queryClient.ensureQueryData(servicesQuery), queryClient.ensureQueryData(categoriesQuery)]),
  component: BookingPage,
});

const STEPS = ["Serviços", "Veículo", "Data e horário", "Seus dados", "Revisão"] as const;

type Draft = {
  serviceIds: string[];
  categoryId: string;
  vehicleModel: string;
  date: string | null;
  startsAt: string | null;
  contact: ContactValues | null;
};

function BookingPage() {
  const { servico } = Route.useSearch();
  const { data: services } = useSuspenseQuery(servicesQuery);
  const { data: categories } = useSuspenseQuery(categoriesQuery);
  const { data: info } = useSuspenseQuery(businessInfoQuery);
  const online = services.filter((s) => s.booking_mode === "online");

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(() => {
    const pre = online.find((s) => s.slug === servico);
    return { serviceIds: pre ? [pre.id] : [], categoryId: "", vehicleModel: "", date: null, startsAt: null, contact: null };
  });
  const headingRef = useRef<HTMLHeadingElement>(null);

  // Move o foco para o título da etapa (leitores de tela e teclado).
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const update = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));
  const quote = useQuery(quoteQuery(draft.serviceIds, draft.categoryId));

  return (
    <div className="mx-auto max-w-6xl px-4 pt-28 pb-16 sm:px-6">
      <div className="mb-8">
        <span className="mb-4 block h-1 w-10 -skew-x-[20deg] bg-racing-500" aria-hidden />
        <h1 className="text-display font-extrabold italic">Agendar serviço</h1>
        <p className="mt-3 text-steel-400">Leva cerca de um minuto. O horário fica reservado até a nossa confirmação pelo WhatsApp.</p>
      </div>

      <Stepper step={step} onJump={(i) => i < step && setStep(i)} />

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        <section aria-labelledby="step-title" className="min-w-0">
          <h2 id="step-title" ref={headingRef} tabIndex={-1} className="mb-6 text-title font-bold outline-none">
            {STEPS[step]}
          </h2>
          <AnimatePresence mode="wait">
            <m.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
              {step === 0 ? (
                <StepServices services={services} categories={categories} info={info} selected={draft.serviceIds} onChange={(ids) => update({ serviceIds: ids, startsAt: null })} onNext={() => setStep(1)} />
              ) : null}
              {step === 1 ? (
                <StepVehicle
                  categories={categories}
                  categoryId={draft.categoryId}
                  model={draft.vehicleModel}
                  onChange={(p) => update({ ...p, startsAt: null })}
                  onBack={() => setStep(0)}
                  onNext={() => setStep(2)}
                />
              ) : null}
              {step === 2 ? (
                <StepSchedule
                  info={info}
                  draft={draft}
                  duration={quote.data?.duration_minutes ?? null}
                  onChange={update}
                  onBack={() => setStep(1)}
                  onNext={() => setStep(3)}
                />
              ) : null}
              {step === 3 ? (
                <StepContact
                  initial={draft.contact}
                  onBack={() => setStep(2)}
                  onNext={(contact) => {
                    update({ contact });
                    setStep(4);
                  }}
                />
              ) : null}
              {step === 4 ? <StepReview draft={draft} categories={categories} onBack={() => setStep(3)} onSlotLost={() => setStep(2)} /> : null}
            </m.div>
          </AnimatePresence>
        </section>

        <Summary draft={draft} categories={categories} quote={quote} />
      </div>
    </div>
  );
}

function Stepper({ step, onJump }: { step: number; onJump: (i: number) => void }) {
  return (
    <nav aria-label="Etapas do agendamento">
      <p className="mb-3 text-sm text-steel-400 sm:hidden">
        Etapa {step + 1} de {STEPS.length}
      </p>
      <ol className="flex gap-1.5">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <button
              type="button"
              onClick={() => onJump(i)}
              disabled={i >= step}
              aria-current={i === step ? "step" : undefined}
              className="group w-full text-left disabled:cursor-default"
            >
              <span className={cn("block h-1 rounded-full transition-colors", i < step ? "bg-racing-500" : i === step ? "bg-pearl" : "bg-graphite-600")} />
              <span className={cn("mt-2 hidden text-xs font-semibold sm:block", i === step ? "text-pearl" : i < step ? "text-steel-300 group-hover:text-pearl" : "text-steel-500")}>
                {label}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function NavButtons({ onBack, onNext, nextLabel = "Continuar", disabled, loading, nextType = "button" }: { onBack?: () => void; onNext?: () => void; nextLabel?: string; disabled?: boolean; loading?: boolean; nextType?: "button" | "submit" }) {
  return (
    <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/5 pt-6">
      {onBack ? (
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden /> Voltar
        </Button>
      ) : (
        <span />
      )}
      <Button type={nextType} onClick={onNext} disabled={disabled} loading={loading} size="lg" className="rounded-control">
        {nextLabel} {nextType === "submit" && nextLabel.startsWith("Enviar") ? <Send className="size-4" aria-hidden /> : <ArrowRight className="size-4" aria-hidden />}
      </Button>
    </div>
  );
}

/* ---------------------------------------------------------------- Etapa 1 */
function StepServices({ services, categories, info, selected, onChange, onNext }: { services: ServiceWithPrices[]; categories: VehicleCategory[]; info: PublicBusinessInfo; selected: string[]; onChange: (ids: string[]) => void; onNext: () => void }) {
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
  if (!services.length) return <EmptyState title="Nenhum serviço disponível agora">Fale com a gente pelo WhatsApp.</EmptyState>;
  return (
    <>
      <p className="mb-4 text-sm text-steel-400">Você pode escolher mais de um. As durações são somadas.</p>
      <ul className="grid gap-3 sm:grid-cols-2">
        {services.map((s) => {
          const price = priceDisplay(s, categories);
          const isOn = selected.includes(s.id);
          if (s.booking_mode === "whatsapp") {
            const wa = waLink(info.whatsapp_phone, msgCheckAvailability(s.name));
            return (
              <li key={s.id} className="flex flex-col gap-3 rounded-control bg-graphite-900 p-4 ring-1 ring-white/[0.06]">
                <div className="flex gap-3">
                  <ServiceIcon category={s.category} className="mt-0.5 size-5 shrink-0 text-steel-400" aria-hidden />
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-steel-400">Serviço longo · agendado pelo WhatsApp</p>
                  </div>
                </div>
                {wa ? (
                  <ExternalButton href={wa} variant="secondary" size="sm" className="self-start">
                    <MessageCircle className="size-4" aria-hidden /> Conferir disponibilidade
                  </ExternalButton>
                ) : null}
              </li>
            );
          }
          return (
            <li key={s.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={isOn}
                onClick={() => toggle(s.id)}
                className={cn(
                  "flex h-full w-full gap-3 rounded-control p-4 text-left ring-1 transition",
                  isOn ? "bg-racing-500/10 ring-racing-500" : "bg-graphite-800 ring-white/[0.08] hover:ring-white/25",
                )}
              >
                <ServiceIcon category={s.category} className={cn("mt-0.5 size-5 shrink-0", isOn ? "text-racing-400" : "text-steel-400")} aria-hidden />
                <span className="flex-1">
                  <span className="block font-bold">{s.name}</span>
                  <span className="mt-0.5 block text-xs text-steel-400">
                    {fmtDuration(s.duration_minutes)} · {price.headline}
                  </span>
                </span>
                <span className={cn("grid size-5 shrink-0 place-items-center rounded-md ring-1", isOn ? "bg-racing-500 ring-racing-500" : "ring-steel-500")} aria-hidden>
                  {isOn ? <Check className="size-3.5 text-white" strokeWidth={3} /> : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      <NavButtons onNext={onNext} disabled={selected.length === 0} />
    </>
  );
}

/* ---------------------------------------------------------------- Etapa 2 */
function StepVehicle({ categories, categoryId, model, onChange, onBack, onNext }: { categories: VehicleCategory[]; categoryId: string; model: string; onChange: (p: { categoryId?: string; vehicleModel?: string }) => void; onBack: () => void; onNext: () => void }) {
  const [touched, setTouched] = useState(false);
  const modelOk = model.trim().length >= 2 && model.trim().length <= 80;
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTouched(true);
        if (categoryId && modelOk) onNext();
      }}
      noValidate
    >
      <fieldset>
        <legend className="label">Categoria do veículo</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {categories.map((c) => (
            <label
              key={c.id}
              className={cn(
                "cursor-pointer rounded-control p-4 ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-racing-400",
                categoryId === c.id ? "bg-racing-500/10 ring-racing-500" : "bg-graphite-800 ring-white/[0.08] hover:ring-white/25",
              )}
            >
              <input type="radio" name="category" value={c.id} checked={categoryId === c.id} onChange={() => onChange({ categoryId: c.id })} className="sr-only" />
              <span className="block font-bold">{c.name}</span>
              <span className="mt-0.5 block text-xs text-steel-400">{c.is_quote_only ? "Valor sob avaliação" : c.description}</span>
            </label>
          ))}
        </div>
        {touched && !categoryId ? <InlineError>Escolha a categoria do veículo.</InlineError> : null}
      </fieldset>
      <Field label="Marca e modelo" htmlFor="model" className="mt-6 max-w-md" error={touched && !modelOk ? "Informe marca e modelo (ex.: Chevrolet Onix)." : undefined}>
        <Input id="model" value={model} maxLength={80} autoComplete="off" placeholder="Ex.: Chevrolet Onix 2021" onChange={(e) => onChange({ vehicleModel: e.target.value })} />
      </Field>
      <NavButtons onBack={onBack} nextType="submit" />
    </form>
  );
}

/* ---------------------------------------------------------------- Etapa 3 */
function StepSchedule({ info, draft, duration, onChange, onBack, onNext }: { info: PublicBusinessInfo; draft: Draft; duration: number | null; onChange: (p: Partial<Draft>) => void; onBack: () => void; onNext: () => void }) {
  const max = addDaysLocal(info.today, info.max_advance_days);
  const closedWeekdays = useMemo(() => new Set(info.hours.filter((h) => !h.is_open).map((h) => h.weekday)), [info.hours]);
  const slots = useQuery({ ...slotsQuery(draft.date ?? "", draft.serviceIds, draft.categoryId), refetchOnMount: "always" });

  return (
    <>
      <div className="grid gap-8 md:grid-cols-[auto_1fr]">
        <MonthCalendar value={draft.date} min={info.today} max={max} isDisabled={(d) => closedWeekdays.has(weekdayOf(d))} onChange={(date) => onChange({ date, startsAt: null })} />
        <div className="min-w-0">
          {!draft.date ? (
            <Notice>Escolha uma data no calendário para ver os horários livres{duration ? ` para ${fmtDuration(duration)} de serviço` : ""}.</Notice>
          ) : slots.isPending ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {Array.from({ length: 12 }, (_, i) => (
                <Skeleton key={i} className="h-11" />
              ))}
            </div>
          ) : slots.isError ? (
            <ErrorState error={slots.error} onRetry={() => slots.refetch()} />
          ) : slots.data.length === 0 ? (
            <EmptyState title="Sem horários livres nesta data" icon={<Clock className="size-5" />}>
              A agenda está cheia ou o serviço não cabe no expediente deste dia. Tente outra data.
            </EmptyState>
          ) : (
            <fieldset>
              <legend className="mb-3 text-sm text-steel-400">
                Horários livres em <span className="font-semibold text-pearl">{fmtDateLong(`${draft.date}T12:00:00-03:00`)}</span>
              </legend>
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">
                {slots.data.map((s) => {
                  const on = draft.startsAt === s.starts_at;
                  return (
                    <button
                      key={s.starts_at}
                      type="button"
                      aria-pressed={on}
                      onClick={() => onChange({ startsAt: s.starts_at })}
                      className={cn(
                        "h-11 rounded-control text-sm font-bold tabular-nums ring-1 transition",
                        on ? "bg-racing-500 text-white ring-racing-500 shadow-cta" : "bg-graphite-800 ring-white/[0.08] hover:ring-white/30",
                      )}
                    >
                      {fmtTime(s.starts_at)}
                    </button>
                  );
                })}
              </div>
              {draft.startsAt ? (
                <p className="mt-4 text-sm text-steel-400">
                  Previsão de término: <span className="font-semibold text-pearl">{fmtTime(slots.data.find((s) => s.starts_at === draft.startsAt)?.ends_at ?? draft.startsAt)}</span>
                </p>
              ) : null}
            </fieldset>
          )}
        </div>
      </div>
      <NavButtons onBack={onBack} onNext={onNext} disabled={!draft.startsAt} />
    </>
  );
}

/* ---------------------------------------------------------------- Etapa 4 */
function StepContact({ initial, onBack, onNext }: { initial: ContactValues | null; onBack: () => void; onNext: (v: ContactValues) => void }) {
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: initial ?? { name: "", phone: "", notes: "", payment_method: undefined as unknown as "pix", website: "" },
  });
  const { register, handleSubmit, formState, setValue, control } = form;
  const method = useWatch({ control, name: "payment_method" });
  return (
    <form onSubmit={handleSubmit(onNext)} noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Seu nome" htmlFor="name" error={formState.errors.name?.message}>
          <Input id="name" autoComplete="name" {...register("name")} />
        </Field>
        <Field label="WhatsApp" htmlFor="phone" error={formState.errors.phone?.message} hint="Usamos só para confirmar o agendamento.">
          <Input
            id="phone"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(49) 99999-9999"
            {...register("phone", { onChange: (e) => setValue("phone", maskPhone(e.target.value)) })}
          />
        </Field>
      </div>
      {/* Honeypot: invisível para pessoas */}
      <div aria-hidden className="absolute -left-[9999px] h-0 overflow-hidden">
        <label htmlFor="website">Site</label>
        <input id="website" tabIndex={-1} autoComplete="off" {...register("website")} />
      </div>
      <fieldset className="mt-6">
        <legend className="label">Forma de pagamento</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              { v: "pix", title: "Pix", text: "Chave exibida ao concluir. Envie o comprovante pelo WhatsApp.", icon: QrCode },
              { v: "cash", title: "Dinheiro", text: "Pagamento presencial, na entrega do veículo.", icon: Banknote },
            ] as const
          ).map((o) => (
            <label
              key={o.v}
              className={cn(
                "flex cursor-pointer gap-3 rounded-control p-4 ring-1 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-racing-400",
                method === o.v ? "bg-racing-500/10 ring-racing-500" : "bg-graphite-800 ring-white/[0.08] hover:ring-white/25",
              )}
            >
              <input type="radio" value={o.v} className="sr-only" {...register("payment_method")} />
              <o.icon className={cn("mt-0.5 size-5 shrink-0", method === o.v ? "text-racing-400" : "text-steel-400")} aria-hidden />
              <span>
                <span className="block font-bold">{o.title}</span>
                <span className="mt-0.5 block text-xs text-steel-400">{o.text}</span>
              </span>
            </label>
          ))}
        </div>
        <InlineError>{formState.errors.payment_method?.message}</InlineError>
      </fieldset>
      <Field label="Observações (opcional)" htmlFor="notes" className="mt-6" error={formState.errors.notes?.message}>
        <Textarea id="notes" maxLength={500} placeholder="Algo que devemos saber sobre o veículo?" {...register("notes")} />
      </Field>
      <NavButtons onBack={onBack} nextType="submit" nextLabel="Revisar pedido" />
    </form>
  );
}

/* ---------------------------------------------------------------- Etapa 5 */
function StepReview({ draft, categories, onBack, onSlotLost }: { draft: Draft; categories: VehicleCategory[]; onBack: () => void; onSlotLost: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const category = categories.find((c) => c.id === draft.categoryId);
  const mutation = useMutation({
    mutationFn: () =>
      createBooking({
        name: draft.contact?.name ?? "",
        phone: draft.contact?.phone ?? "",
        notes: draft.contact?.notes ?? "",
        website: draft.contact?.website ?? "",
        payment_method: draft.contact?.payment_method ?? "pix",
        vehicle_category_id: draft.categoryId,
        vehicle_model: draft.vehicleModel,
        service_ids: draft.serviceIds,
        starts_at: draft.startsAt ?? "",
      }),
    onSuccess: (code) => navigate({ to: "/agendamento/confirmacao", search: { codigo: code }, replace: true }),
    onError: (e) => {
      const msg = errorMessage(e);
      setError(msg);
      if (String((e as { message?: string }).message ?? "").includes("slot_unavailable") && draft.date) {
        void qc.invalidateQueries({ queryKey: ["booking", "slots", draft.date] });
      }
    },
  });
  const slotLost = error && mutation.error && String((mutation.error as { message?: string }).message).includes("slot_unavailable");

  return (
    <div>
      <dl className="divide-y divide-white/5 rounded-control bg-graphite-800 ring-1 ring-white/[0.06]">
        {[
          ["Nome", draft.contact?.name],
          ["WhatsApp", draft.contact?.phone],
          ["Veículo", `${category?.name ?? ""} · ${draft.vehicleModel}`],
          ["Data", draft.startsAt ? fmtDateLong(draft.startsAt) : ""],
          ["Horário", draft.startsAt ? fmtTime(draft.startsAt) : ""],
          ["Pagamento", draft.contact?.payment_method === "pix" ? "Pix" : "Dinheiro"],
          ...(draft.contact?.notes ? [["Observações", draft.contact.notes]] : []),
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-sm">
            <dt className="text-steel-400">{k}</dt>
            <dd className="text-right font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
      <Notice className="mt-5">
        Ao enviar, o horário fica reservado e o pedido fica <strong className="text-pearl">aguardando confirmação da Tassionero</strong>. A confirmação e o valor final chegam pelo WhatsApp.
      </Notice>
      {error ? (
        <div role="alert" className="mt-5 rounded-control bg-danger/10 px-4 py-3 text-sm text-steel-200 ring-1 ring-danger/30">
          {error}
          {slotLost ? (
            <button type="button" onClick={onSlotLost} className="mt-2 block font-semibold text-racing-300 underline underline-offset-4">
              Escolher outro horário
            </button>
          ) : null}
        </div>
      ) : null}
      <NavButtons onBack={onBack} onNext={() => { setError(null); mutation.mutate(); }} loading={mutation.isPending} nextLabel="Enviar solicitação" nextType="button" />
    </div>
  );
}

/* ---------------------------------------------------------------- Resumo lateral */
function Summary({ draft, categories, quote }: { draft: Draft; categories: VehicleCategory[]; quote: UseQueryResult<ServiceQuote> }) {
  const category = categories.find((c) => c.id === draft.categoryId);
  return (
    <aside aria-label="Resumo do agendamento" className="h-fit rounded-panel bg-graphite-900 p-5 ring-1 ring-white/[0.06] lg:sticky lg:top-24">
      <h2 className="text-sm font-bold text-steel-300">Resumo</h2>
      {draft.serviceIds.length === 0 ? (
        <p className="mt-3 text-sm text-steel-500">Escolha os serviços para ver duração e valores.</p>
      ) : !draft.categoryId ? (
        <p className="mt-3 text-sm text-steel-500">Informe a categoria do veículo para calcular os valores de referência.</p>
      ) : quote.isPending ? (
        <div className="mt-4 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : quote.isError ? (
        <p className="mt-3 text-sm text-danger">{errorMessage(quote.error)}</p>
      ) : quote.data ? (
        <>
          <ul className="mt-4 space-y-2 text-sm">
            {quote.data.items.map((i) => (
              <li key={i.service_id} className="flex justify-between gap-3">
                <span>
                  {i.name} <span className="text-steel-500">· {fmtDuration(i.duration_minutes)}</span>
                </span>
                <span className="font-semibold">{i.reference_price === null ? "Avaliação" : fmtMoney(i.reference_price)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-white/5 pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-steel-400">Duração prevista</span>
              <span className="font-semibold">{fmtDuration(quote.data.duration_minutes)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-steel-400">Referência</span>
              <span className="text-lg font-extrabold">{quote.data.reference_total === null ? "Sob avaliação" : fmtMoney(quote.data.reference_total)}</span>
            </div>
          </div>
          {quote.data.is_estimate ? <p className="mt-3 text-xs text-steel-500">Valor final confirmado após avaliação do veículo.</p> : null}
        </>
      ) : null}
      {category || draft.startsAt ? (
        <div className="mt-4 space-y-1 border-t border-white/5 pt-4 text-sm text-steel-300">
          {category ? <p>{category.name}{draft.vehicleModel ? ` · ${draft.vehicleModel}` : ""}</p> : null}
          {draft.startsAt ? (
            <p className="font-semibold text-pearl">
              {fmtDateLong(draft.startsAt)}, {fmtTime(draft.startsAt)}
            </p>
          ) : null}
        </div>
      ) : null}
      <p className="mt-5 text-xs text-steel-500">
        Dúvidas? <Link to="/contato" className="underline underline-offset-2 hover:text-pearl">Fale com a gente</Link>.
      </p>
    </aside>
  );
}

